"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, LogOut, Bell, BellOff, Settings, AlertTriangle } from "lucide-react";
import { requestPushPermission } from "@/components/providers/pwa-provider";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const restaurant = useQuery(api.restaurants.getCurrent);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const saveSubscription = useMutation(api.pushSubscriptions.save);

  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm">("idle");
  const [isDeleting, setIsDeleting] = useState(false);
  const [notifStatus, setNotifStatus] = useState<"unknown" | "granted" | "denied">(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "denied";
    return Notification.permission === "granted" ? "granted" : Notification.permission === "denied" ? "denied" : "unknown";
  });

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  async function handleDeleteAccount() {
    if (deleteStep === "idle") {
      setDeleteStep("confirm");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount();
      await signOut();
      router.push("/");
      toast.success("Votre compte a été supprimé.");
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      setIsDeleting(false);
      setDeleteStep("idle");
    }
  }

  async function handleEnableNotifications() {
    const granted = await requestPushPermission();
    if (!granted) {
      setNotifStatus("denied");
      toast.error("Notifications refusées. Activez-les dans les paramètres de votre navigateur.");
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    if (sub) {
      const json = sub.toJSON();
      if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
        await saveSubscription({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth });
      }
    }
    setNotifStatus("granted");
    toast.success("Notifications activées !");
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Paramètres" description={restaurant?.name} />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 animate-fade-in-up max-w-2xl">

        {/* Account info */}
        <section className="card-whisper p-5 sm:p-6 space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} className="text-muted-gray" aria-hidden="true" />
            <p className="text-caption font-semibold text-uber-black">Mon compte</p>
          </div>
          <p className="text-micro text-muted-gray">Restaurant</p>
          <p className="text-caption font-medium text-uber-black">{restaurant?.name ?? "—"}</p>
          <p className="text-micro text-muted-gray mt-2">Slug public</p>
          <p className="text-caption font-mono text-uber-black">/m/{restaurant?.slug ?? "—"}</p>
        </section>

        {/* Push notifications */}
        <section className="card-whisper p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-muted-gray" aria-hidden="true" />
            <p className="text-caption font-semibold text-uber-black">Notifications push</p>
          </div>

          {notifStatus === "granted" && (
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chip-gray">
                <Bell size={13} className="text-uber-black" />
              </div>
              <p className="text-caption text-uber-black flex-1">Notifications activées sur cet appareil</p>
            </div>
          )}

          {notifStatus === "denied" && (
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chip-gray">
                <BellOff size={13} className="text-muted-gray" />
              </div>
              <p className="text-caption text-muted-gray flex-1">
                Notifications bloquées. Autorisez-les dans les paramètres de votre navigateur puis rechargez la page.
              </p>
            </div>
          )}

          {notifStatus === "unknown" && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-caption text-muted-gray flex-1">
                Recevez une alerte instantanée sur cet appareil à chaque nouvelle commande.
              </p>
              <Button
                onClick={handleEnableNotifications}
                className="rounded-full bg-uber-black text-white text-caption font-medium px-5 shrink-0"
              >
                <Bell size={14} aria-hidden="true" />
                Activer
              </Button>
            </div>
          )}
        </section>

        {/* Sign out */}
        <section className="card-whisper p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogOut size={16} className="text-muted-gray" aria-hidden="true" />
            <p className="text-caption font-semibold text-uber-black">Session</p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="rounded-full border-uber-black text-caption font-medium gap-2"
          >
            <LogOut size={14} aria-hidden="true" />
            Se déconnecter
          </Button>
        </section>

        {/* Danger zone */}
        <section className="rounded-[var(--radius-lg)] border border-destructive/30 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-destructive" aria-hidden="true" />
            <p className="text-caption font-semibold text-destructive">Zone de danger</p>
          </div>

          {deleteStep === "idle" && (
            <div className="space-y-3">
              <p className="text-micro text-muted-gray">
                La suppression est <strong className="text-uber-black">définitive</strong> et irréversible.
                Votre restaurant, menu, commandes et toutes les données associées seront effacés.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="rounded-full text-caption font-medium gap-2"
              >
                <Trash2 size={14} aria-hidden="true" />
                Supprimer mon compte
              </Button>
            </div>
          )}

          {deleteStep === "confirm" && (
            <div className="space-y-3">
              <div className="rounded-[var(--radius-md)] bg-destructive/5 border border-destructive/20 px-4 py-3">
                <p className="text-caption font-semibold text-destructive mb-1">Êtes-vous absolument certain ?</p>
                <p className="text-micro text-muted-gray">
                  Cette action supprimera <strong>définitivement</strong> votre compte ainsi que toutes vos données.
                  Il n'y a aucun moyen d'annuler cela.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteStep("idle")}
                  disabled={isDeleting}
                  className="rounded-full text-caption font-medium border-border"
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="rounded-full text-caption font-medium gap-2"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  {isDeleting ? "Suppression…" : "Oui, supprimer définitivement"}
                </Button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
