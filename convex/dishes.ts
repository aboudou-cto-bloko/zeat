import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const dishes = await ctx.db
      .query("dishes")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();
    return dishes.sort((a, b) => a.position - b.position);
  },
});

// For public menu – only available dishes
export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const dishes = await ctx.db
      .query("dishes")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    return dishes
      .filter((d) => d.available)
      .sort((a, b) => a.position - b.position);
  },
});

export const create = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(), // in XOF
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!restaurant) throw new Error("Restaurant not found");

    const existing = await ctx.db
      .query("dishes")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    return ctx.db.insert("dishes", {
      restaurantId: restaurant._id,
      categoryId: args.categoryId,
      name: args.name,
      description: args.description,
      price: args.price,
      available: true,
      position: existing.length,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dishes"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      price: args.price,
      available: args.available,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("dishes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return ctx.db.delete(args.id);
  },
});
