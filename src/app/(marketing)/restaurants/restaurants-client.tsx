"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Search, ArrowRight, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";

// ── Avatar color ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-[#1a1a1a]",
  "bg-[#2d4a3e]",
  "bg-[#3d2b1f]",
  "bg-[#1e3a5f]",
  "bg-[#4a1942]",
  "bg-[#3b3000]",
  "bg-[#1f3d2b]",
  "bg-[#2e1f4a]",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ── Sort options ───────────────────────────────────────────────────────────────

type SortKey = "newest" | "oldest" | "az" | "za" | "dishes";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Plus récents" },
  { key: "oldest", label: "Plus anciens" },
  { key: "az", label: "A → Z" },
  { key: "za", label: "Z → A" },
  { key: "dishes", label: "Plus de plats" },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function RestaurantsClient() {
  const restaurants = useQuery(api.restaurants.listAll);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    if (!restaurants) return [];
    let list = [...restaurants];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }

    // Sort
    switch (sort) {
      case "newest":
        list.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "oldest":
        list.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "az":
        list.sort((a, b) => a.name.localeCompare(b.name, "fr"));
        break;
      case "za":
        list.sort((a, b) => b.name.localeCompare(a.name, "fr"));
        break;
      case "dishes":
        list.sort((a, b) => b.dishCount - a.dishCount);
        break;
    }

    return list;
  }, [restaurants, search, sort]);

  const isLoading = restaurants === undefined;

  return (
    <div className="min-h-screen bg-zeat-beige">
      {/* Nav */}
      <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-zeat-beige/90 backdrop-blur-xl px-8 border-b border-border">
        <Link
          href="/"
          className="font-heading text-[22px] font-bold tracking-tighter text-uber-black"
        >
          Zeat
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-caption font-medium text-body-gray hover:text-uber-black transition-colors px-3 py-1.5"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-uber-black text-white font-bold px-5 py-2 text-caption hover:bg-body-gray transition-colors"
          >
            Créer mon menu
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-10 px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-micro font-medium text-muted-gray mb-3 uppercase tracking-wider">
            Restaurants sur Zeat
          </p>
          <h1 className="text-display text-uber-black mb-3">
            Explorer les menus
          </h1>
          <p className="text-body text-body-gray max-w-lg">
            Découvrez les restaurants qui utilisent Zeat et passez commande directement depuis leur menu.
          </p>
        </div>
      </section>

      {/* Search + Sort */}
      <div className="sticky top-16 z-10 bg-zeat-beige/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-4xl px-8 py-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-gray"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Rechercher un restaurant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-zeat pl-9"
              aria-label="Rechercher un restaurant"
            />
          </div>

          {/* Sort pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none shrink-0">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                aria-pressed={sort === opt.key}
                className={`pill-chip shrink-0 text-caption transition-colors ${
                  sort === opt.key
                    ? "bg-uber-black text-white"
                    : "hover:bg-chip-gray"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-4xl px-8 py-8 pb-20">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-whisper p-6 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-chip-gray mb-4" />
                <div className="h-4 w-3/4 rounded-full bg-chip-gray mb-2" />
                <div className="h-3 w-1/2 rounded-full bg-chip-gray" />
              </div>
            ))}
          </div>
        )}

        {/* No restaurants at all */}
        {!isLoading && restaurants.length === 0 && (
          <div className="py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chip-gray mx-auto mb-4">
              <UtensilsCrossed size={22} className="text-muted-gray" aria-hidden="true" />
            </div>
            <p className="text-body font-semibold text-uber-black mb-1">
              Aucun restaurant pour l&apos;instant
            </p>
            <p className="text-caption text-muted-gray mb-6">
              Soyez le premier à créer votre menu sur Zeat.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-uber-black text-white font-bold px-7 py-3 text-caption hover:bg-body-gray transition-colors"
            >
              Créer mon menu
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* No search results */}
        {!isLoading && restaurants.length > 0 && filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-body font-semibold text-uber-black mb-1">
              Aucun résultat pour &laquo;&nbsp;{search}&nbsp;&raquo;
            </p>
            <p className="text-caption text-muted-gray">
              Essayez un autre nom de restaurant.
            </p>
          </div>
        )}

        {/* Cards */}
        {!isLoading && filtered.length > 0 && (
          <>
            <p className="text-micro text-muted-gray mb-5">
              {filtered.length} restaurant{filtered.length > 1 ? "s" : ""}
              {search ? ` pour « ${search} »` : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <Link
                  key={r._id}
                  href={`/m/${r.slug}`}
                  className="card-whisper p-6 flex flex-col gap-4 group hover:shadow-[var(--shadow-medium)] transition-shadow"
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${avatarColor(r.name)} text-white font-heading text-[18px] font-bold shrink-0`}
                  >
                    {r.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-semibold text-uber-black group-hover:underline underline-offset-2 truncate">
                      {r.name}
                    </p>
                    <p className="text-micro text-muted-gray mt-1">
                      {r.dishCount > 0
                        ? `${r.dishCount} plat${r.dishCount > 1 ? "s" : ""} · ${r.categoryCount} catégorie${r.categoryCount > 1 ? "s" : ""}`
                        : "Menu en cours de création"}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-micro font-semibold text-uber-black">
                    Voir le menu
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-uber-black py-8 px-8 text-center">
        <Link
          href="/"
          className="font-heading text-[18px] font-bold text-white tracking-tighter"
        >
          Zeat
        </Link>
        <p className="text-micro text-muted-gray mt-2">Le menu. Distillé.</p>
      </footer>
    </div>
  );
}
