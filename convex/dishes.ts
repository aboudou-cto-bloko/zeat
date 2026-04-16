import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Helpers ────────────────────────────────────────────────────────────────────

async function resolveImageUrl(
  ctx: { storage: { getUrl: (id: string) => Promise<string | null> } },
  imageId?: string
): Promise<string | null> {
  if (!imageId) return null;
  return ctx.storage.getUrl(imageId);
}

// ── Queries ────────────────────────────────────────────────────────────────────

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const dishes = await ctx.db
      .query("dishes")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    return Promise.all(
      dishes
        .sort((a, b) => a.position - b.position)
        .map(async (dish) => ({
          ...dish,
          imageUrl: await resolveImageUrl(ctx, dish.imageId),
        }))
    );
  },
});

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const dishes = await ctx.db
      .query("dishes")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    return Promise.all(
      dishes
        .filter((d) => d.available)
        .sort((a, b) => a.position - b.position)
        .map(async (dish) => ({
          ...dish,
          imageUrl: await resolveImageUrl(ctx, dish.imageId),
        }))
    );
  },
});

// ── Upload URL ─────────────────────────────────────────────────────────────────

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return ctx.storage.generateUploadUrl();
  },
});

// ── Mutations ──────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    imageId: v.optional(v.id("_storage")),
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
      imageId: args.imageId,
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
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const dish = await ctx.db.get(args.id);
    if (!dish) throw new Error("Dish not found");

    // Delete old image from storage if it's being replaced by a different one
    if (
      dish.imageId &&
      args.imageId !== undefined &&
      args.imageId !== dish.imageId
    ) {
      await ctx.storage.delete(dish.imageId);
    }

    return ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      price: args.price,
      available: args.available,
      imageId: args.imageId,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("dishes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const dish = await ctx.db.get(args.id);
    if (!dish) return;

    // Delete associated image from storage
    if (dish.imageId) {
      await ctx.storage.delete(dish.imageId);
    }

    return ctx.db.delete(args.id);
  },
});
