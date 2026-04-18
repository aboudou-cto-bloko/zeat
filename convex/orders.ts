import { mutation, query, internalQuery } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { requireOwnership } from "./lib";

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    note: v.optional(v.string()),
    items: v.array(
      v.object({
        dishId: v.id("dishes"),
        dishName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      })
    ),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) throw new Error("Order must contain at least one item");
    if (args.customerName.trim().length === 0) throw new Error("Customer name required");
    if (args.customerName.length > 100) throw new Error("Customer name too long");
    if (args.note && args.note.length > 500) throw new Error("Note too long");

    // Recompute prices server-side — never trust client-supplied amounts
    const resolvedItems = await Promise.all(
      args.items.map(async (item) => {
        if (!Number.isInteger(item.quantity) || item.quantity < 1)
          throw new Error("Invalid quantity");
        const dish = await ctx.db.get(item.dishId);
        if (!dish || dish.restaurantId !== args.restaurantId)
          throw new Error(`Invalid dish: ${item.dishId}`);
        return { ...item, dishName: dish.name, unitPrice: dish.price };
      })
    );
    const total = resolvedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const orderId = await ctx.db.insert("orders", {
      restaurantId: args.restaurantId,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      note: args.note,
      items: resolvedItems,
      total,
      status: "pending",
      createdAt: Date.now(),
    });

    // Fire push + email notifications server-side (non-blocking)
    await ctx.scheduler.runAfter(0, internal.pushNotifications.sendOrderNotification, {
      restaurantId: args.restaurantId,
      customerName: args.customerName,
      total,
      itemCount: resolvedItems.reduce((sum, i) => sum + i.quantity, 0),
    });
    await ctx.scheduler.runAfter(0, internal.emailNotifications.sendOrderEmail, {
      orderId,
    });

    return orderId;
  },
});

export const getById = internalQuery({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

// Full list (for dashboard stats — just counts pending)
export const listByRestaurant = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!restaurant) return [];

    return ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", restaurant._id)
      )
      .order("desc")
      .collect();
  },
});

// Paginated list — for the orders page (avoids loading all orders at once)
export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { page: [], isDone: true, continueCursor: "" };

    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!restaurant) return { page: [], isDone: true, continueCursor: "" };

    return ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", restaurant._id)
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    await requireOwnership(ctx, userId, order.restaurantId);
    return ctx.db.patch(args.id, { status: args.status });
  },
});
