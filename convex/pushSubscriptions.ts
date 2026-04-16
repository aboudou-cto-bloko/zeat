import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Subscription management ──────────────────────────────────────────────────

export const save = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      return ctx.db.patch(existing._id, {
        p256dh: args.p256dh,
        auth: args.auth,
      });
    }

    return ctx.db.insert("pushSubscriptions", {
      userId,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
    });
  },
});

export const remove = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
