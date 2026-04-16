import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Zap,
  QrCode,
  BellRing,
  UtensilsCrossed,
  Search,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Zeat — Le menu. Distillé.",
  description:
    "Créez votre menu digital en 60 secondes. Partagez le lien, recevez les commandes directement — sans commission ni plateforme.",
  openGraph: {
    title: "Zeat — Vos clients commandent. Vous encaissez.",
    description:
      "Créez votre menu, partagez le lien, recevez les commandes. Zéro commission. Zéro plateforme.",
    url: "/",
  },
};

// ── Avatar color (same logic as explorer page) ────────────────────────────────
const AVATAR_COLORS = [
  "#1a1a1a",
  "#2d4a3e",
  "#3d2b1f",
  "#1e3a5f",
  "#4a1942",
  "#3b3000",
  "#1f3d2b",
  "#2e1f4a",
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── Server data ───────────────────────────────────────────────────────────────
async function getFeaturedRestaurants() {
  try {
    const all = await fetchQuery(api.restaurants.listAll);
    // Show up to 3 restaurants that have at least some dishes
    return all
      .sort((a, b) => (b.dishCount ?? 0) - (a.dishCount ?? 0))
      .slice(0, 3);
  } catch {
    return [];
  }
}

async function getRestaurantCount() {
  try {
    const all = await fetchQuery(api.restaurants.listAll);
    return all.length;
  } catch {
    return 0;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function LandingPage() {
  const [featured, count] = await Promise.all([
    getFeaturedRestaurants(),
    getRestaurantCount(),
  ]);

  return (
    <div className="min-h-screen bg-pure-white">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-pure-white/90 backdrop-blur-xl px-5 sm:px-8 border-b border-border"
        aria-label="Navigation principale"
      >
        <Link
          href="/"
          className="font-heading text-[22px] font-bold tracking-tighter text-uber-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          translate="no"
        >
          Zeat
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/restaurants"
            className="hidden sm:block text-caption font-medium text-body-gray hover:text-uber-black transition-colors px-3 py-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Explorer les menus
          </Link>
          <Link
            href="/login"
            className="text-caption font-medium text-body-gray hover:text-uber-black transition-colors px-3 py-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-uber-black text-white font-bold px-4 sm:px-5 py-2 text-caption hover:bg-body-gray transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Inscription
          </Link>
        </div>
      </nav>

      {/* ── Hero — split layout (Uber Eats structure, Zeat identity) ──── */}
      <section className="min-h-screen bg-zeat-beige flex items-center pt-16">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-uber-black/8 px-4 py-2 text-micro font-semibold text-uber-black mb-6">
              <span
                className="h-1.5 w-1.5 rounded-full bg-uber-black shrink-0"
                aria-hidden="true"
              />
              Sans commission · Sans plateforme
            </div>

            <h1 className="text-headline-lg sm:text-display text-uber-black mb-5 text-pretty leading-[1.1]">
              Vos clients commandent.
              <br />
              <span className="text-muted-gray">Vous encaissez.</span>
            </h1>

            <p className="text-body text-body-gray max-w-md mb-8 leading-relaxed">
              Créez votre menu digital en 60 secondes, partagez le lien ou le QR
              code — vos clients commandent directement depuis leur téléphone,
              sans passer par une plateforme.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/signup">
                <Button className="rounded-full bg-uber-black text-white font-bold px-7 py-3 text-caption hover:bg-body-gray gap-2 h-auto">
                  Créer mon menu gratuitement
                  <ArrowRight size={15} aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/restaurants">
                <Button
                  variant="outline"
                  className="rounded-full border-uber-black/20 text-caption font-medium text-body-gray hover:border-uber-black hover:text-uber-black px-6 py-3 h-auto transition-colors"
                >
                  Explorer les menus
                </Button>
              </Link>
            </div>

            <p className="text-micro text-muted-gray mt-5">
              Gratuit. Sans carte bancaire.
              {count > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <strong className="text-uber-black font-semibold">
                    {count} restaurant{count > 1 ? "s" : ""}
                  </strong>{" "}
                  déjà sur Zeat.
                </>
              )}
            </p>
          </div>

          {/* Right: iPhone 15 with real app screenshot */}
          <div
            className="relative flex justify-center lg:justify-end"
            aria-hidden="true"
          >
            <div className="relative">
              {/* Side buttons — left (mute + volume) */}
              <div className="absolute left-[-3px] top-[88px] w-[3px] h-[28px] rounded-l-sm bg-[#3a3a3c]" />
              <div className="absolute left-[-3px] top-[128px] w-[3px] h-[52px] rounded-l-sm bg-[#3a3a3c]" />
              <div className="absolute left-[-3px] top-[190px] w-[3px] h-[52px] rounded-l-sm bg-[#3a3a3c]" />
              {/* Side button — right (power) */}
              <div className="absolute right-[-3px] top-[140px] w-[3px] h-[68px] rounded-r-sm bg-[#3a3a3c]" />

              {/* iPhone shell — black titanium */}
              <div className="relative w-[270px] sm:w-[290px] rounded-[52px] bg-[#1c1c1e] p-[3px] shadow-[0_40px_80px_rgba(0,0,0,0.30),0_0_0_1px_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                {/* Inner screen bezel */}
                <div className="relative rounded-[50px] overflow-hidden bg-black">
                  {/* Dynamic Island */}
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 z-10 w-[88px] h-[28px] bg-black rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />

                  {/* Real app screenshot */}
                  <Image
                    src="/app-screenshot.png"
                    alt="Interface Zeat — menu Chez Fatou"
                    width={290}
                    height={628}
                    className="w-full object-cover object-top"
                    priority
                  />
                </div>
              </div>

              {/* Floating notification badge */}
              <div className="absolute top-[80px] -right-8 z-20 rounded-2xl bg-pure-white shadow-[var(--shadow-float)] border border-border px-3 py-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-uber-black shrink-0">
                  <BellRing size={12} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-uber-black leading-none">
                    Nouvelle commande
                  </p>
                  <p className="text-[9px] text-muted-gray mt-0.5">
                    Kofi · 3 450 FCFA
                  </p>
                </div>
              </div>

              {/* QR floating badge */}
              <div className="absolute -bottom-3 -left-5 rounded-2xl bg-uber-black shadow-[var(--shadow-float)] px-3 py-2 flex items-center gap-2">
                <QrCode size={14} className="text-white" />
                <p className="text-[10px] font-semibold text-white">
                  Scan &amp; Commander
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip (Uber Eats: présence géo → Zeat: valeur différenciante) */}
      <div className="bg-uber-black py-6 px-5 sm:px-8">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
          {[
            { value: "60 s", label: "pour créer son menu" },
            { value: "0 %", label: "de commission" },
            { value: "∞", label: "commandes incluses" },
            {
              value: count > 0 ? `${count}+` : "✓",
              label: count > 0 ? "restaurants actifs" : "Gratuit à démarrer",
            },
          ].map((s) => (
            <div key={s.label}>
              <p
                className="font-heading text-[28px] sm:text-[32px] font-bold text-white leading-none"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {s.value}
              </p>
              <p className="text-micro text-muted-gray mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Audience split (Uber Eats: 3 cartes éditoriales → Zeat: 2 audiences) */}
      <section className="py-20 sm:py-24 px-5 sm:px-8 bg-pure-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-headline-md text-uber-black text-center mb-3 text-pretty">
            Une solution pour chacun
          </h2>
          <p className="text-body text-muted-gray text-center mb-12 max-w-md mx-auto">
            Que vous soyez restaurateur ou client, Zeat simplifie
            l&apos;expérience de bout en bout.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Card: restaurateurs */}
            <Link
              href="/signup"
              className="group relative overflow-hidden rounded-[var(--radius-xl)] bg-uber-black p-8 sm:p-10 flex flex-col justify-between min-h-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div
                className="absolute inset-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20"
                style={{
                  background:
                    "radial-gradient(ellipse at 80% 20%, #f5f0eb 0%, transparent 60%)",
                }}
                aria-hidden="true"
              />
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 mb-5">
                  <UtensilsCrossed
                    size={18}
                    className="text-white"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-micro font-semibold text-white/60 uppercase tracking-widest mb-2">
                  Pour les restaurateurs
                </p>
                <h3 className="text-headline-sm text-white text-pretty mb-3">
                  Créez votre menu digital
                </h3>
                <p className="text-caption text-white/70 leading-relaxed max-w-xs">
                  Ajoutez vos plats, personnalisez votre vitrine avec logo et
                  bannière, partagez le lien ou le QR code — vos clients
                  commandent directement.
                </p>
              </div>
              <div className="relative flex items-center gap-2 text-caption font-semibold text-white mt-6">
                Créer mon menu gratuitement
                <ArrowRight
                  size={15}
                  className="transition-transform duration-150 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </div>
            </Link>

            {/* Card: clients */}
            <Link
              href="/restaurants"
              className="group relative overflow-hidden rounded-[var(--radius-xl)] bg-zeat-beige p-8 sm:p-10 flex flex-col justify-between min-h-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-uber-black/8 mb-5">
                  <Search
                    size={18}
                    className="text-uber-black"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-micro font-semibold text-muted-gray uppercase tracking-widest mb-2">
                  Pour les clients
                </p>
                <h3 className="text-headline-sm text-uber-black text-pretty mb-3">
                  Explorez et commandez
                </h3>
                <p className="text-caption text-body-gray leading-relaxed max-w-xs">
                  Parcourez les menus des restaurants autour de vous. Cherchez
                  un plat, ajoutez au panier et passez commande — directement,
                  sans frais cachés.
                </p>
              </div>
              <div className="flex items-center gap-2 text-caption font-semibold text-uber-black mt-6">
                Explorer les menus
                <ArrowRight
                  size={15}
                  className="transition-transform duration-150 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche (Uber Eats: implicite → Zeat: explicite numbered) */}
      <section className="py-20 sm:py-24 px-5 sm:px-8 bg-zeat-beige">
        <div className="mx-auto max-w-4xl">
          <p className="text-micro font-semibold text-muted-gray uppercase tracking-widest text-center mb-3">
            Simple comme bonjour
          </p>
          <h2 className="text-headline-md text-uber-black text-center mb-14 text-pretty">
            Votre menu en ligne en 3 étapes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-8 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-border"
              aria-hidden="true"
            />

            {[
              {
                n: "01",
                icon: <Zap size={20} />,
                title: "Créez votre menu",
                desc: "Inscrivez-vous, ajoutez vos catégories et vos plats avec photos et prix en quelques minutes.",
              },
              {
                n: "02",
                icon: <QrCode size={20} />,
                title: "Partagez le lien",
                desc: "Obtenez votre page publique et votre QR code. Partagez via WhatsApp, Instagram, ou imprimez le QR.",
              },
              {
                n: "03",
                icon: <BellRing size={20} />,
                title: "Recevez les commandes",
                desc: "Chaque commande vous est notifiée par push et email, en temps réel, directement dans votre dashboard.",
              },
            ].map((step) => (
              <div key={step.n} className="relative flex flex-col items-start">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-uber-black text-white mb-5 shadow-[var(--shadow-float)]">
                  {step.icon}
                </div>
                <p className="text-[11px] font-bold text-muted-gray tracking-widest uppercase mb-2">
                  {step.n}
                </p>
                <h3 className="text-caption font-semibold text-uber-black mb-2">
                  {step.title}
                </h3>
                <p className="text-micro text-body-gray leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/m/demo" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="rounded-full border-uber-black/20 text-caption font-medium hover:border-uber-black hover:text-uber-black px-7 py-3 h-auto gap-2"
              >
                <Star size={14} aria-hidden="true" />
                Voir un exemple de menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured restaurants (Uber Eats: villes → Zeat: restos en vedette) */}
      {featured.length > 0 && (
        <section className="py-20 sm:py-24 px-5 sm:px-8 bg-pure-white">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-micro font-semibold text-muted-gray uppercase tracking-widest mb-2">
                  Déjà sur Zeat
                </p>
                <h2 className="text-headline-md text-uber-black text-pretty">
                  Découvrez les restaurants
                </h2>
              </div>
              <Link
                href="/restaurants"
                className="hidden sm:flex items-center gap-1.5 text-caption font-semibold text-uber-black hover:underline underline-offset-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                Voir tous
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featured.map((r) => {
                const color = avatarColor(r.name);
                return (
                  <Link
                    key={r._id}
                    href={`/m/${r.slug}`}
                    className="group card-whisper overflow-hidden flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-[var(--radius-lg)]"
                    aria-label={`Voir le menu de ${r.name}`}
                  >
                    {/* Banner */}
                    <div className="relative aspect-[3/2] overflow-hidden">
                      {r.bannerUrl ? (
                        <Image
                          src={r.bannerUrl}
                          alt=""
                          fill
                          sizes="(max-width:640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ backgroundColor: color }}
                          aria-hidden="true"
                        >
                          <span className="font-heading text-[56px] font-bold text-white/15 select-none">
                            {r.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Logo badge */}
                      <div className="absolute bottom-3 left-3">
                        {r.logoUrl ? (
                          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-[var(--shadow-float)]">
                            <Image
                              src={r.logoUrl}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-[var(--shadow-float)] font-heading text-sm font-bold text-white"
                            style={{ backgroundColor: color }}
                            aria-hidden="true"
                          >
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <p className="text-caption font-semibold text-uber-black truncate group-hover:underline underline-offset-2">
                        {r.name}
                      </p>
                      <p className="text-micro text-muted-gray">
                        {(r.dishCount ?? 0) > 0
                          ? `${r.dishCount} plat${(r.dishCount ?? 0) > 1 ? "s" : ""}`
                          : "Menu en cours de création"}
                      </p>
                      <div className="flex items-center gap-1 text-micro font-semibold text-uber-black mt-auto pt-1">
                        Voir le menu
                        <ArrowRight
                          size={11}
                          className="transition-transform duration-150 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 sm:hidden text-center">
              <Link href="/restaurants">
                <Button
                  variant="outline"
                  className="rounded-full border-uber-black/20 text-caption font-medium hover:border-uber-black px-7 py-3 h-auto gap-2"
                >
                  Voir tous les restaurants
                  <ArrowRight size={14} aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-uber-black py-20 sm:py-28 px-5 sm:px-8 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-micro font-semibold text-white/40 uppercase tracking-widest mb-4">
            Rejoignez Zeat
          </p>
          <h2 className="text-headline-md sm:text-headline-lg text-white mb-5 text-pretty">
            Prêt à digitaliser votre restaurant ?
          </h2>
          <p className="text-body text-white/60 mb-8 max-w-md mx-auto">
            Gratuit. Sans carte bancaire. Sans commission. Votre menu en ligne
            en moins d&apos;une heure.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup">
              <Button className="rounded-full bg-pure-white text-uber-black font-bold px-8 py-3 text-caption hover:bg-zeat-beige gap-2 h-auto transition-colors">
                Créer mon menu gratuitement
                <ArrowRight size={15} aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/m/demo" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="rounded-full border-white/20 text-white text-caption font-medium px-7 py-3 h-auto hover:border-white/60 hover:bg-white/5 transition-colors"
              >
                Voir un exemple
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer (Uber Eats: multi-col → Zeat: 3 colonnes + tagline) ──── */}
      <footer className="bg-uber-black border-t border-white/8 py-12 px-5 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <Link
                href="/"
                className="font-heading text-[20px] font-bold text-white tracking-tighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
                translate="no"
              >
                Zeat
              </Link>
              <p className="text-micro text-white/40 mt-2 leading-relaxed">
                Le menu. Distillé.
              </p>
            </div>

            {/* Produit */}
            <div>
              <p className="text-micro font-semibold text-white/40 uppercase tracking-widest mb-3">
                Produit
              </p>
              <ul className="space-y-2">
                {[
                  { href: "/signup", label: "Créer un menu" },
                  { href: "/login", label: "Connexion" },
                  { href: "/m/demo", label: "Démo" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-micro text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-sm"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Explorer */}
            <div>
              <p className="text-micro font-semibold text-white/40 uppercase tracking-widest mb-3">
                Explorer
              </p>
              <ul className="space-y-2">
                {[
                  { href: "/restaurants", label: "Tous les restaurants" },
                  { href: "/restaurants", label: "Rechercher un plat" },
                ].map((l, i) => (
                  <li key={i}>
                    <Link
                      href={l.href}
                      className="text-micro text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-sm"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <p className="text-micro font-semibold text-white/40 uppercase tracking-widest mb-3">
                Aide
              </p>
              <ul className="space-y-2">
                {[
                  { href: "/dashboard/settings", label: "Paramètres" },
                  { href: "/signup", label: "Démarrer" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-micro text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-sm"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-micro text-white/30">
              © {new Date().getFullYear()} Zeat. Tous droits réservés.
            </p>
            <p className="text-micro text-white/30">Fait au Bénin</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
