"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * PwaProvider — registers the service worker and subscribes the current user
 * to push notifications if they're logged in and have granted permission.
 * Rendered once at the root layout (client-only, renders nothing).
 */
export function PwaProvider() {
  const saveSubscription = useMutation(api.pushSubscriptions.save);
  const deleteSubscription = useMutation(api.pushSubscriptions.remove);
  const mySubscriptions = useQuery(api.pushSubscriptions.listMine);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    )
      return;

    // Register the service worker
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        // Only subscribe if user has already granted notification permission
        // (we prompt explicitly in the dashboard)
        if (Notification.permission === "granted") {
          subscribeUser(registration);
        }

        // Clean up expired subscriptions that are no longer in the browser
        registration.pushManager.getSubscription().then((browserSub) => {
          if (!browserSub && mySubscriptions && mySubscriptions.length > 0) {
            // All stored subscriptions are stale for this browser — clean them
            mySubscriptions.forEach((s) =>
              deleteSubscription({ endpoint: s.endpoint })
            );
          }
        });
      })
      .catch((err) => console.warn("[SW] Registration failed:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function subscribeUser(registration: ServiceWorkerRegistration) {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    try {
      const existingSub = await registration.pushManager.getSubscription();
      const sub = existingSub ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

      await saveSubscription({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      });
    } catch (err) {
      console.warn("[SW] Push subscription failed:", err);
    }
  }

  return null;
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Call this from the dashboard to request notification permission
 * and subscribe the user. Returns true if permission was granted.
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const registration = await navigator.serviceWorker.ready;
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return false;

  try {
    const existingSub = await registration.pushManager.getSubscription();
    const sub = existingSub ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;

    return true;
  } catch {
    return false;
  }
}
