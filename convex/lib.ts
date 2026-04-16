import { GenericDatabaseReader } from "convex/server";
import { DataModel, Doc, Id } from "./_generated/dataModel";

type DbCtx = { db: GenericDatabaseReader<DataModel> };

/**
 * Resolves the restaurant owned by `userId`.
 * Throws if the user has no restaurant.
 */
export async function getCallerRestaurant(
  ctx: DbCtx,
  userId: Id<"users">
): Promise<Doc<"restaurants">> {
  const restaurant = await ctx.db
    .query("restaurants")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  if (!restaurant) throw new Error("Restaurant not found");
  return restaurant;
}

/**
 * Asserts that the caller owns the restaurant identified by `restaurantId`.
 * Throws "Forbidden" if the IDs don't match.
 * Returns the restaurant document on success.
 */
export async function requireOwnership(
  ctx: DbCtx,
  userId: Id<"users">,
  restaurantId: Id<"restaurants">
): Promise<Doc<"restaurants">> {
  const restaurant = await getCallerRestaurant(ctx, userId);
  if (restaurant._id !== restaurantId) throw new Error("Forbidden");
  return restaurant;
}
