import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create restaurant profile after signup
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Ensure slug is unique
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error("SLUG_TAKEN");

    return ctx.db.insert("restaurants", {
      userId,
      name: args.name,
      slug: args.slug,
      createdAt: Date.now(),
    });
  },
});

// Get the current user's restaurant
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ctx.db
      .query("restaurants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Get restaurant by slug (public, no auth required)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// List all restaurants (public discovery page)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const restaurants = await ctx.db
      .query("restaurants")
      .order("desc")
      .collect();

    return Promise.all(
      restaurants.map(async (r) => {
        const [dishes, categories] = await Promise.all([
          ctx.db
            .query("dishes")
            .withIndex("by_restaurant", (q) => q.eq("restaurantId", r._id))
            .collect(),
          ctx.db
            .query("categories")
            .withIndex("by_restaurant", (q) => q.eq("restaurantId", r._id))
            .collect(),
        ]);
        return {
          ...r,
          dishCount: dishes.filter((d) => d.available).length,
          categoryCount: categories.length,
        };
      })
    );
  },
});

// Get restaurant by ID (used internally by push notification action)
export const getById = query({
  args: { id: v.id("restaurants") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

// Update restaurant name
export const update = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!restaurant) throw new Error("Restaurant not found");
    return ctx.db.patch(restaurant._id, { name: args.name });
  },
});
