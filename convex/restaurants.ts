import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function withBrandingUrls<T extends { logoId?: string; bannerId?: string }>(
  ctx: { storage: { getUrl: (id: string) => Promise<string | null> } },
  r: T
) {
  const [logoUrl, bannerUrl] = await Promise.all([
    r.logoId ? ctx.storage.getUrl(r.logoId) : Promise.resolve(null),
    r.bannerId ? ctx.storage.getUrl(r.bannerId) : Promise.resolve(null),
  ]);
  return { ...r, logoUrl, bannerUrl };
}

// ── Mutations ────────────────────────────────────────────────────────────────

// Create restaurant profile after signup
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

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

// Update restaurant name + description
export const update = mutation({
  args: { name: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!restaurant) throw new Error("Restaurant not found");
    return ctx.db.patch(restaurant._id, {
      name: args.name,
      description: args.description,
    });
  },
});

// Generate upload URL for logo / banner
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return ctx.storage.generateUploadUrl();
  },
});

// Save logo or banner storage ID (replaces old file)
export const updateBranding = mutation({
  args: {
    logoId: v.optional(v.id("_storage")),
    bannerId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!restaurant) throw new Error("Restaurant not found");

    // Delete old storage files if replacing
    if (args.logoId !== undefined && restaurant.logoId && args.logoId !== restaurant.logoId) {
      await ctx.storage.delete(restaurant.logoId);
    }
    if (args.bannerId !== undefined && restaurant.bannerId && args.bannerId !== restaurant.bannerId) {
      await ctx.storage.delete(restaurant.bannerId);
    }

    return ctx.db.patch(restaurant._id, {
      ...(args.logoId !== undefined ? { logoId: args.logoId } : {}),
      ...(args.bannerId !== undefined ? { bannerId: args.bannerId } : {}),
    });
  },
});

// Remove logo or banner
export const removeBranding = mutation({
  args: { field: v.union(v.literal("logo"), v.literal("banner")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!restaurant) throw new Error("Restaurant not found");

    if (args.field === "logo" && restaurant.logoId) {
      await ctx.storage.delete(restaurant.logoId);
      await ctx.db.patch(restaurant._id, { logoId: undefined });
    }
    if (args.field === "banner" && restaurant.bannerId) {
      await ctx.storage.delete(restaurant.bannerId);
      await ctx.db.patch(restaurant._id, { bannerId: undefined });
    }
  },
});

// ── Queries ──────────────────────────────────────────────────────────────────

// Get the current user's restaurant (with resolved image URLs)
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const r = await ctx.db
      .query("restaurants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!r) return null;
    return withBrandingUrls(ctx, r);
  },
});

// Get restaurant by slug — public, resolves image URLs
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const r = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!r) return null;
    return withBrandingUrls(ctx, r);
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
        const [dishes, categories, withUrls] = await Promise.all([
          ctx.db
            .query("dishes")
            .withIndex("by_restaurant", (q) => q.eq("restaurantId", r._id))
            .collect(),
          ctx.db
            .query("categories")
            .withIndex("by_restaurant", (q) => q.eq("restaurantId", r._id))
            .collect(),
          withBrandingUrls(ctx, r),
        ]);
        return {
          ...withUrls,
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
