import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * search.dishes — uses Convex full-text search indexes.
 *
 * Before: full table scan (O(N) for all dishes + O(M) for all restaurants).
 * After:  indexed search — O(log N) lookup, max 40 results.
 *
 * Searches both dish name and description, merges results, deduplicates.
 */
export const dishes = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    const q = args.q.trim();
    if (q.length < 2) return [];

    // Run name + description searches in parallel, both filtered to available only
    const [byName, byDesc] = await Promise.all([
      ctx.db
        .query("dishes")
        .withSearchIndex("search_name", (s) =>
          s.search("name", q).eq("available", true)
        )
        .take(40),
      ctx.db
        .query("dishes")
        .withSearchIndex("search_description", (s) =>
          s.search("description", q).eq("available", true)
        )
        .take(20),
    ]);

    // Merge and deduplicate by _id
    const seen = new Set<string>();
    const merged: typeof byName = [];
    for (const d of [...byName, ...byDesc]) {
      if (!seen.has(d._id)) {
        seen.add(d._id);
        merged.push(d);
      }
    }

    // Batch-fetch restaurants (one read per unique restaurantId)
    const restaurantIds = [...new Set(merged.map((d) => d.restaurantId))];
    const restaurants = await Promise.all(restaurantIds.map((id) => ctx.db.get(id)));
    const restaurantMap = new Map(
      restaurants
        .filter(Boolean)
        .map((r) => [r!._id, { name: r!.name, slug: r!.slug }])
    );

    // Resolve image URLs in parallel — only for results that have an image
    return Promise.all(
      merged.slice(0, 40).map(async (d) => {
        const restaurant = restaurantMap.get(d.restaurantId);
        return {
          _id: d._id,
          name: d.name,
          description: d.description,
          price: d.price,
          imageUrl: d.imageId ? await ctx.storage.getUrl(d.imageId) : null,
          restaurantName: restaurant?.name ?? "",
          restaurantSlug: restaurant?.slug ?? "",
        };
      })
    );
  },
});
