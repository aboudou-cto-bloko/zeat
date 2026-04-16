"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import webpush from "web-push";

/**
 * sendOrderNotification — sends a Web Push to the restaurant owner.
 * Called via ctx.scheduler.runAfter(0, ...) from the orders.create mutation.
 */
export const sendOrderNotification = action({
  args: {
    restaurantId: v.id("restaurants"),
    customerName: v.string(),
    total: v.number(),
    itemCount: v.number(),
  },
  handler: async (ctx, args) => {
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL ?? "mailto:zeat@pixel-mart-bj.com";

    if (!vapidPublic || !vapidPrivate) return;

    const restaurant = await ctx.runQuery(api.restaurants.getById, {
      id: args.restaurantId,
    });
    if (!restaurant) return;

    const subscriptions = await ctx.runQuery(
      internal.pushSubscriptions.listByUserId,
      { userId: restaurant.userId }
    );
    if (!subscriptions.length) return;

    webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

    const formattedTotal = new Intl.NumberFormat("fr-FR").format(args.total);
    const payload = JSON.stringify({
      title: "🍽️ Nouvelle commande !",
      body: `${args.customerName} — ${args.itemCount} article${args.itemCount > 1 ? "s" : ""} · ${formattedTotal} FCFA`,
      url: "/dashboard/orders",
      icon: "/icon.svg",
      badge: "/icon.svg",
    });

    await Promise.allSettled(
      subscriptions.map(async (sub: { endpoint: string; p256dh: string; auth: string }) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
        } catch (err: unknown) {
          if (
            err &&
            typeof err === "object" &&
            "statusCode" in err &&
            (err as { statusCode: number }).statusCode === 410
          ) {
            await ctx.runMutation(api.pushSubscriptions.remove, {
              endpoint: sub.endpoint,
            });
          }
        }
      })
    );
  },
});
