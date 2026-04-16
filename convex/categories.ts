import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireOwnership } from "./lib";

export const list = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const cats = await ctx.db
      .query("categories")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
    return cats.sort((a, b) => a.position - b.position);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
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
      .query("categories")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    const catId = await ctx.db.insert("categories", {
      restaurantId: restaurant._id,
      name: args.name,
      position: existing.length,
    });

    // Keep denormalized counter in sync
    await ctx.db.patch(restaurant._id, {
      categoryCount: (restaurant.categoryCount ?? 0) + 1,
    });

    return catId;
  },
});

export const update = mutation({
  args: { id: v.id("categories"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Category not found");
    await requireOwnership(ctx, userId, category.restaurantId);
    return ctx.db.patch(args.id, { name: args.name });
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category) return;
    await requireOwnership(ctx, userId, category.restaurantId);

    // Cascade delete dishes + their images
    const dishes = await ctx.db
      .query("dishes")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();

    const availableDeleted = dishes.filter((d) => d.available).length;

    await Promise.all(
      dishes.map(async (d) => {
        if (d.imageId) await ctx.storage.delete(d.imageId);
        return ctx.db.delete(d._id);
      })
    );

    await ctx.db.delete(args.id);

    // Keep denormalized counters in sync
    const restaurant = await ctx.db.get(category.restaurantId);
    if (restaurant) {
      await ctx.db.patch(restaurant._id, {
        categoryCount: Math.max(0, (restaurant.categoryCount ?? 1) - 1),
        dishCount: Math.max(0, (restaurant.dishCount ?? dishes.length) - dishes.length),
        availableDishCount: Math.max(
          0,
          (restaurant.availableDishCount ?? availableDeleted) - availableDeleted
        ),
      });
    }
  },
});
