import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Convex Auth handles users + sessions automatically
  ...authTables,

  // Restaurant profile linked to the auth user
  restaurants: defineTable({
    userId: v.id("users"), // from authTables
    name: v.string(),
    slug: v.string(), // unique public URL identifier
    description: v.optional(v.string()),
    logoId: v.optional(v.id("_storage")),       // 400×400, circle on storefront
    bannerId: v.optional(v.id("_storage")),     // 1280×400, full-width hero
    // Denormalized counters — kept in sync by dishes/categories mutations
    // Eliminates N+1 queries in listAll. Use ?? 0 when reading.
    dishCount: v.optional(v.number()),
    availableDishCount: v.optional(v.number()),
    categoryCount: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"]),

  // Scope 2 – Categories
  categories: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    position: v.number(),
  }).index("by_restaurant", ["restaurantId"]),

  // Scope 2 – Dishes
  dishes: defineTable({
    restaurantId: v.id("restaurants"),
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(), // in XOF (whole francs)
    available: v.boolean(),
    position: v.number(),
    imageId: v.optional(v.id("_storage")),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_category", ["categoryId"])
    // Full-text search index — eliminates full table scan on search
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["available"],
    })
    .searchIndex("search_description", {
      searchField: "description",
      filterFields: ["available"],
    }),

  // Push notification subscriptions (one per browser/device per restaurant owner)
  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  // Scope 3 – Orders
  orders: defineTable({
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
    total: v.number(), // in XOF (whole francs)
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("done")
    ),
    createdAt: v.number(),
  }).index("by_restaurant", ["restaurantId"]),
});
