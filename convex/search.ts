import { query } from "./_generated/server";
import { v } from "convex/values";

export const dishes = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    const q = args.q.toLowerCase().trim();
    if (q.length < 2) return [];

    const [restaurants, allDishes] = await Promise.all([
      ctx.db.query("restaurants").collect(),
      ctx.db.query("dishes").collect(),
    ]);

    const restaurantMap = new Map(
      restaurants.map((r) => [r._id, { name: r.name, slug: r.slug }])
    );

    const matched = allDishes.filter(
      (d) =>
        d.available &&
        (d.name.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q))
    );

    // Resolve image URLs and attach restaurant info
    const results = await Promise.all(
      matched.slice(0, 40).map(async (d) => {
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

    return results;
  },
});
