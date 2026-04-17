import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: params.email as string,
          restaurantName: params.restaurantName as string | undefined,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }
      const userId = await ctx.db.insert("users", {
        email: args.profile.email as string,
      });
      const restaurantName = args.profile.restaurantName as string | undefined;
      if (!restaurantName) throw new Error("Restaurant name required");
      const slug =
        slugify(restaurantName) + "-" + Math.random().toString(36).slice(2, 6);
      await ctx.db.insert("restaurants", {
        userId,
        name: restaurantName,
        slug,
        createdAt: Date.now(),
      });
      return userId;
    },
  },
});
