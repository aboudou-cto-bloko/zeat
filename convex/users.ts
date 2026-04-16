import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * deleteAccount — cascade-deletes everything owned by the current user:
 * push subscriptions → dishes (+ storage) → categories → orders → restaurant → user
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (restaurant) {
      // 1. Delete all orders
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
        .collect();
      await Promise.all(orders.map((o) => ctx.db.delete(o._id)));

      // 2. Delete all dishes + their storage images
      const dishes = await ctx.db
        .query("dishes")
        .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
        .collect();
      await Promise.all(
        dishes.map(async (d) => {
          if (d.imageId) await ctx.storage.delete(d.imageId);
          return ctx.db.delete(d._id);
        })
      );

      // 3. Delete all categories
      const categories = await ctx.db
        .query("categories")
        .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
        .collect();
      await Promise.all(categories.map((c) => ctx.db.delete(c._id)));

      // 4. Delete restaurant
      await ctx.db.delete(restaurant._id);
    }

    // 5. Delete push subscriptions
    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    await Promise.all(subs.map((s) => ctx.db.delete(s._id)));

    // 6. Delete the user record itself
    await ctx.db.delete(userId);
  },
});
