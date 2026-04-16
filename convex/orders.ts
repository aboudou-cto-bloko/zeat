import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

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
    const orderId = await ctx.db.insert("orders", {
      restaurantId: args.restaurantId,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      note: args.note,
      items: args.items,
      total: args.total,
      status: "pending",
      createdAt: Date.now(),
    });

    // Fire push notification to restaurant owner (non-blocking)
    await ctx.scheduler.runAfter(0, api.pushNotifications.sendOrderNotification, {
      restaurantId: args.restaurantId,
      customerName: args.customerName,
      total: args.total,
      itemCount: args.items.reduce((sum, i) => sum + i.quantity, 0),
    });

    return orderId;
  },
});

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
    return ctx.db.patch(args.id, { status: args.status });
  },
});
