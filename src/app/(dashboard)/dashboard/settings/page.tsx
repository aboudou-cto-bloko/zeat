"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { compressImage, IMAGE_PRESETS } from "@/lib/compress-image";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Trash2,
  LogOut,
  Bell,
  BellOff,
  Settings,
  AlertTriangle,
  Upload,
  X,
  Image as ImageIcon,
  Share2,
  Copy,
  Check,
  QrCode,
} from "lucide-react";
import { requestPushPermission } from "@/components/providers/pwa-provider";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

// ── Dimension constants (single source of truth) ─────────────────────────────
const LOGO_SPECS = {
  recommended: "400 × 400 px",
  ratio: "1:1",
  maxMb: 2,
  displayDesc: "Affiché en cercle — 80 px (mobile) · 96 px (desktop)",
};
const BANNER_SPECS = {
  recommended: "1280 × 400 px",
  ratio: "16:5",
  maxMb: 5,
  displayDesc: "Hauteur : 180 px (mobile) · 240 px (desktop)",
};

// ── Upload helper (compress → upload) ────────────────────────────────────────

async function uploadFile(
  file: File,
  generateUrl: () => Promise<string>,
  preset: keyof typeof IMAGE_PRESETS
): Promise<Id<"_storage">> {
  // Compress client-side before uploading — reduces storage + bandwidth 10–30×
  const compressed = await compressImage(
    file,
    IMAGE_PRESETS[preset].maxWidth,
    IMAGE_PRESETS[preset].maxHeight,
    IMAGE_PRESETS[preset].quality
  );

  const uploadUrl = await generateUrl();
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": compressed.type },
    body: compressed,
  });
  if (!res.ok) throw new Error("Upload failed");
  const { storageId } = await res.json();
  return storageId as Id<"_storage">;
}

// ── Image upload dropzone ─────────────────────────────────────────────────────

function ImageUploadZone({
  label,
  hint,
  recommended,
  ratio,
  maxMb,
  displayDesc,
  currentUrl,
  isCircle,
  previewAspect,
  onUpload,
  onRemove,
  uploading,
}: {
  label: string;
  hint: string;
  recommended: string;
  ratio: string;
  maxMb: number;
  displayDesc: string;
  currentUrl: string | null | undefined;
  isCircle?: boolean;
  previewAspect: string; // tailwind aspect-* class
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Fichier non supporté. Utilisez PNG, JPEG ou WebP.");
        return;
      }
      if (file.size > maxMb * 1024 * 1024) {
        toast.error(`Taille max ${maxMb} Mo.`);
        return;
      }
      const preview = URL.createObjectURL(file);
      setLocalPreview(preview);
      await onUpload(file);
    },
    [maxMb, onUpload]
  );

  const displayUrl = localPreview ?? currentUrl;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-caption font-semibold text-uber-black">{label}</p>
          <p className="text-micro text-muted-gray mt-0.5">{hint}</p>
        </div>
        {displayUrl && (
          <button
            onClick={() => {
              setLocalPreview(null);
              onRemove();
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chip-gray hover:bg-hover-gray transition-colors"
            aria-label={`Supprimer ${label}`}
          >
            <X size={13} className="text-uber-black" />
          </button>
        )}
      </div>

      {/* Dropzone / preview */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Choisir ${label}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`relative overflow-hidden cursor-pointer rounded-[var(--radius-lg)] border-2 border-dashed transition-colors
          ${dragOver ? "border-uber-black bg-chip-gray" : "border-border bg-background hover:border-uber-black/40 hover:bg-chip-gray/40"}
          ${isCircle ? "w-24 h-24 rounded-full mx-auto" : `w-full ${previewAspect}`}
        `}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={label}
            fill
            sizes={isCircle ? "96px" : "(max-width: 640px) 100vw, 640px"}
            className={`object-cover ${isCircle ? "rounded-full" : "rounded-[calc(var(--radius-lg)-2px)]"}`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-uber-black border-t-transparent" />
            ) : (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-chip-gray">
                  <ImageIcon size={16} className="text-muted-gray" />
                </div>
                <p className="text-micro text-muted-gray text-center px-2">
                  Cliquer ou glisser
                </p>
              </>
            )}
          </div>
        )}
        {uploading && displayUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-uber-black border-t-transparent" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Upload button if no image */}
      {!displayUrl && !uploading && (
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-full border-border text-caption font-medium gap-2"
        >
          <Upload size={14} aria-hidden="true" />
          Choisir un fichier
        </Button>
      )}

      {/* Dimension guide */}
      <div className="rounded-[var(--radius-md)] bg-chip-gray px-3 py-2.5 space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="text-micro font-semibold text-uber-black">Dimensions recommandées</span>
          <span className="text-micro text-muted-gray">— {ratio}</span>
        </div>
        <p className="text-micro text-muted-gray font-mono">{recommended}</p>
        <p className="text-micro text-muted-gray">{displayDesc}</p>
        <p className="text-micro text-muted-gray">Format : PNG · JPEG · WebP · max {maxMb} Mo</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const restaurant = useQuery(api.restaurants.getCurrent);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const saveSubscription = useMutation(api.pushSubscriptions.save);
  const generateUploadUrl = useMutation(api.restaurants.generateUploadUrl);
  const updateBranding = useMutation(api.restaurants.updateBranding);
  const removeBranding = useMutation(api.restaurants.removeBranding);

  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm">("idle");
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [copied, setCopied] = useState(false);

  const [notifStatus, setNotifStatus] = useState<"unknown" | "granted" | "denied">(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "denied";
    return Notification.permission === "granted"
      ? "granted"
      : Notification.permission === "denied"
      ? "denied"
      : "unknown";
  });

  const publicUrl =
    typeof window !== "undefined" && restaurant
      ? `${window.location.origin}/m/${restaurant.slug}`
      : restaurant
      ? `https://zeat.vercel.app/m/${restaurant.slug}`
      : "";

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  async function handleDeleteAccount() {
    if (deleteStep === "idle") { setDeleteStep("confirm"); return; }
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

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);
    try {
      const storageId = await uploadFile(file, generateUploadUrl, "logo");
      await updateBranding({ logoId: storageId });
      toast.success("Logo mis à jour !");
    } catch {
      toast.error("Erreur lors de l'upload du logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleBannerUpload(file: File) {
    setUploadingBanner(true);
    try {
      const storageId = await uploadFile(file, generateUploadUrl, "banner");
      await updateBranding({ bannerId: storageId });
      toast.success("Bannière mise à jour !");
    } catch {
      toast.error("Erreur lors de l'upload de la bannière.");
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Lien copié !");
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: `Menu — ${restaurant?.name}`,
        text: "Découvrez notre menu et passez commande en ligne.",
        url: publicUrl,
      });
    } else {
      handleCopy();
    }
  }

  function handleDownloadQR() {
    const svg = document.querySelector("#qr-code-svg") as SVGElement | null;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-zeat-${restaurant?.slug ?? "menu"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("QR code téléchargé !");
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Paramètres" description={restaurant?.name} />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 animate-fade-in-up max-w-2xl">

        {/* ── Account info ─────────────────────────────────────────────── */}
        <section className="card-whisper p-5 sm:p-6 space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} className="text-muted-gray" aria-hidden="true" />
            <p className="text-caption font-semibold text-uber-black">Mon compte</p>
          </div>
          <p className="text-micro text-muted-gray">Restaurant</p>
          <p className="text-caption font-medium text-uber-black">{restaurant?.name ?? "—"}</p>
          <p className="text-micro text-muted-gray mt-2">Lien public</p>
          <p className="text-caption font-mono text-uber-black">/m/{restaurant?.slug ?? "—"}</p>
        </section>

        {/* ── Branding ─────────────────────────────────────────────────── */}
        <section className="card-whisper p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-muted-gray" aria-hidden="true" />
            <p className="text-caption font-semibold text-uber-black">Identité visuelle</p>
          </div>

          {/* Logo */}
          <ImageUploadZone
            label="Logo"
            hint="Visible sur votre storefront, en cercle"
            {...LOGO_SPECS}
            currentUrl={restaurant?.logoUrl}
            isCircle
            previewAspect="aspect-square"
            onUpload={handleLogoUpload}
            onRemove={() => removeBranding({ field: "logo" })}
            uploading={uploadingLogo}
          />

          <div className="border-t border-border" />

          {/* Banner */}
          <ImageUploadZone
            label="Bannière"
            hint="Image plein-largeur en haut de votre storefront"
            {...BANNER_SPECS}
            currentUrl={restaurant?.bannerUrl}
            isCircle={false}
            previewAspect="aspect-[16/5]"
            onUpload={handleBannerUpload}
            onRemove={() => removeBranding({ field: "banner" })}
            uploading={uploadingBanner}
          />
        </section>

        {/* ── Share + QR ───────────────────────────────────────────────── */}
        {restaurant && (
          <section className="card-whisper p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Share2 size={16} className="text-muted-gray" aria-hidden="true" />
              <p className="text-caption font-semibold text-uber-black">Partager le menu</p>
            </div>

            {/* URL row */}
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-chip-gray px-3 py-2">
              <p className="flex-1 text-micro font-mono text-uber-black truncate">{publicUrl}</p>
              <button
                onClick={handleCopy}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-hover-gray transition-colors"
                aria-label="Copier le lien"
              >
                {copied
                  ? <Check size={13} className="text-uber-black" />
                  : <Copy size={13} className="text-muted-gray" />
                }
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleShare}
                className="flex-1 rounded-full bg-uber-black text-white text-caption font-medium gap-2"
              >
                <Share2 size={14} aria-hidden="true" />
                Partager
              </Button>
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex-1 rounded-full border-uber-black text-caption font-medium gap-2"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copié !" : "Copier le lien"}
              </Button>
            </div>

            {/* QR Code */}
            <div className="border-t border-border pt-5 space-y-4">
              <div className="flex items-center gap-2">
                <QrCode size={14} className="text-muted-gray" aria-hidden="true" />
                <p className="text-caption font-medium text-uber-black">Code QR</p>
              </div>
              <p className="text-micro text-muted-gray">
                Imprimez-le et affichez-le à votre caisse ou sur chaque table pour que vos clients scannent et commandent directement.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* QR visual */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-whisper)]">
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={publicUrl}
                      size={160}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleDownloadQR}
                    className="w-full rounded-full border-border text-caption font-medium gap-1.5 text-[12px]"
                    size="sm"
                  >
                    Télécharger SVG
                  </Button>
                </div>

                {/* Tips */}
                <div className="space-y-2 text-micro text-muted-gray">
                  <p className="font-semibold text-uber-black">Conseils d&apos;impression</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Taille minimum : <strong className="text-uber-black">3 × 3 cm</strong> pour une lecture fiable</li>
                    <li>Fond blanc, encre noire — évitez les couleurs sur le QR</li>
                    <li>Testez le scan avant d&apos;imprimer en masse</li>
                    <li>Idéal sur support A6, flyer ou sticker de table</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Push notifications ───────────────────────────────────────── */}
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
                className="rounded-full bg-uber-black text-white text-caption font-medium px-5 shrink-0 gap-2"
              >
                <Bell size={14} aria-hidden="true" />
                Activer
              </Button>
            </div>
          )}
        </section>

        {/* ── Sign out ─────────────────────────────────────────────────── */}
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

        {/* ── Danger zone ──────────────────────────────────────────────── */}
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
                  Cette action supprimera <strong>définitivement</strong> votre compte et toutes vos données.
                  Il n&apos;y a aucun moyen d&apos;annuler cela.
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
