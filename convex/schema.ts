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
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_category", ["categoryId"]),

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
