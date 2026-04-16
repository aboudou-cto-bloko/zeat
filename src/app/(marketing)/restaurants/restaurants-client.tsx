"use client";

import { useState, useMemo, useId } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, UtensilsCrossed, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useDebounce } from "@/lib/use-debounce";

// ── Avatar color ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#1a1a1a", "#2d4a3e", "#3d2b1f",
  "#1e3a5f", "#4a1942", "#3b3000",
  "#1f3d2b", "#2e1f4a",
];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── Sort options ──────────────────────────────────────────────────────────────
type SortKey = "newest" | "oldest" | "az" | "za" | "dishes";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest",  label: "Plus récents"  },
  { key: "oldest",  label: "Plus anciens"  },
  { key: "az",      label: "A → Z"         },
  { key: "za",      label: "Z → A"         },
  { key: "dishes",  label: "Plus de plats" },
];

// ── Tab type ──────────────────────────────────────────────────────────────────
type Tab = "restaurants" | "plats";

// ── Skeleton ──────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="card-whisper overflow-hidden animate-pulse" aria-hidden="true">
      <div className="aspect-[3/2] bg-chip-gray" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded-full bg-chip-gray" />
        <div className="h-3 w-1/2 rounded-full bg-chip-gray" />
      </div>
    </div>
  );
}
function DishSkeleton() {
  return (
    <div className="card-whisper p-4 flex gap-4 animate-pulse" aria-hidden="true">
      <div className="h-16 w-16 rounded-[var(--radius-md)] bg-chip-gray shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-2/3 rounded-full bg-chip-gray" />
        <div className="h-3 w-1/2 rounded-full bg-chip-gray" />
      </div>
    </div>
  );
}

// ── Restaurant card ───────────────────────────────────────────────────────────
function RestaurantCard({ r }: { r: {
  _id: string; name: string; slug: string;
  logoUrl?: string | null; bannerUrl?: string | null;
  dishCount: number; categoryCount: number; description?: string | null;
}}) {
  const color = avatarColor(r.name);
  const initial = r.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/m/${r.slug}`}
      className="card-whisper overflow-hidden flex flex-col group focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-[var(--radius-lg)]"
      aria-label={`Voir le menu de ${r.name}`}
    >
      {/* Banner / hero area */}
      <div className="relative aspect-[3/2] overflow-hidden bg-chip-gray">
        {r.bannerUrl ? (
          <Image
            src={r.bannerUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          >
            <span className="font-heading text-[64px] font-bold text-white/20 select-none">
              {initial}
            </span>
          </div>
        )}
        {/* Logo badge */}
        <div className="absolute bottom-3 left-3">
          {r.logoUrl ? (
            <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-white shadow-[var(--shadow-float)]">
              <Image src={r.logoUrl} alt="" fill sizes="44px" className="object-cover" />
            </div>
          ) : (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white shadow-[var(--shadow-float)] font-heading text-[16px] font-bold text-white"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            >
              {initial}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex-1 min-w-0">
          <p className="text-caption font-semibold text-uber-black truncate group-hover:underline underline-offset-2 decoration-[1.5px]">
            {r.name}
          </p>
          {r.description ? (
            <p className="text-micro text-muted-gray mt-0.5 line-clamp-1">{r.description}</p>
          ) : r.dishCount > 0 ? (
            <p className="text-micro text-muted-gray mt-0.5">
              {r.dishCount} plat{r.dishCount > 1 ? "s" : ""}
              {r.categoryCount > 0 && ` · ${r.categoryCount} catégorie${r.categoryCount > 1 ? "s" : ""}`}
            </p>
          ) : (
            <p className="text-micro text-muted-gray mt-0.5 italic">Menu en cours de création</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-micro font-semibold text-uber-black">
          Voir le menu
          <ArrowRight
            size={12}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}

// ── Dish row ──────────────────────────────────────────────────────────────────
function DishRow({ dish }: { dish: {
  _id: string; name: string; description?: string | null;
  price: number; imageUrl?: string | null;
  restaurantName: string; restaurantSlug: string;
}}) {
  return (
    <Link
      href={`/m/${dish.restaurantSlug}`}
      className="card-whisper p-4 flex items-center gap-4 group hover:shadow-[var(--shadow-medium)] transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-[var(--radius-lg)]"
      aria-label={`${dish.name} — ${dish.restaurantName}`}
    >
      {dish.imageUrl ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
          <Image src={dish.imageUrl} alt="" fill sizes="64px" className="object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-chip-gray">
          <UtensilsCrossed size={18} className="text-muted-gray" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-caption font-semibold text-uber-black truncate group-hover:underline underline-offset-2">
          {dish.name}
        </p>
        {dish.description && (
          <p className="text-micro text-muted-gray mt-0.5 line-clamp-1">{dish.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-caption font-bold text-uber-black" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatPrice(dish.price)}
          </span>
          <span className="text-micro text-muted-gray" aria-hidden="true">·</span>
          <span className="text-micro text-muted-gray truncate">{dish.restaurantName}</span>
        </div>
      </div>
      <ArrowRight size={15} className="text-muted-gray shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RestaurantsClient() {
  const searchId = useId();
  const restaurants = useQuery(api.restaurants.listAll);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [activeTab, setActiveTab] = useState<Tab>("restaurants");

  // Debounce: don't fire Convex subscription on every keystroke (saves WS messages)
  const debouncedQuery = useDebounce(query, 280);
  const isSearching = debouncedQuery.trim().length >= 2;

  // Dish search — only fires when debounced query ≥ 2 chars
  const dishResults = useQuery(
    api.search.dishes,
    isSearching ? { q: debouncedQuery.trim() } : "skip"
  );

  // Filtered restaurants — uses debounced query to stay in sync with dish results
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];
    let list = [...restaurants];
    if (isSearching) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
    }
    switch (sort) {
      case "newest":  list.sort((a, b) => b.createdAt - a.createdAt); break;
      case "oldest":  list.sort((a, b) => a.createdAt - b.createdAt); break;
      case "az":      list.sort((a, b) => a.name.localeCompare(b.name, "fr")); break;
      case "za":      list.sort((a, b) => b.name.localeCompare(a.name, "fr")); break;
      case "dishes":  list.sort((a, b) => b.dishCount - a.dishCount); break;
    }
    return list;
  }, [restaurants, debouncedQuery, sort, isSearching]);

  const isLoadingRestaurants = restaurants === undefined;
  const isLoadingDishes = isSearching && dishResults === undefined;

  // Auto-switch tab based on results when searching
  const dishCount = dishResults?.length ?? 0;
  const restCount = filteredRestaurants.length;

  function clearSearch() {
    setQuery("");
  }

  return (
    <div className="min-h-screen bg-zeat-beige">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-zeat-beige/90 backdrop-blur-xl px-4 sm:px-8 border-b border-border gap-3"
        aria-label="Navigation principale"
      >
        <Link
          href="/"
          className="font-heading text-[20px] font-bold tracking-tighter text-uber-black shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          translate="no"
        >
          Zeat
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="text-caption font-medium text-body-gray hover:text-uber-black transition-colors px-3 py-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-uber-black text-white font-bold px-4 py-2 text-caption hover:bg-body-gray transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Créer mon menu
          </Link>
        </div>
      </nav>

      {/* ── Hero + Search ────────────────────────────────────────────────── */}
      <section className="pt-28 pb-8 px-4 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-micro font-semibold text-muted-gray mb-2 uppercase tracking-widest">
            Restaurants sur Zeat
          </p>
          <h1 className="text-headline-lg sm:text-display text-uber-black mb-3 text-pretty">
            Explorer les menus
          </h1>
          <p className="text-body text-body-gray max-w-md mb-8">
            Parcourez les restaurants et les plats disponibles — commandez directement, sans commission.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl">
            <label htmlFor={searchId} className="sr-only">
              Rechercher un restaurant ou un plat
            </label>
            <Input
              id={searchId}
              type="search"
              name="q"
              autoComplete="off"
              spellCheck={false}
              placeholder="Restaurant, plat, ingrédient…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-zeat pl-4 pr-11 h-12 text-[15px] w-full"
              style={{ touchAction: "manipulation" }}
            />
            {query ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Effacer la recherche"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-chip-gray hover:bg-hover-gray transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X size={12} className="text-uber-black" aria-hidden="true" />
              </button>
            ) : (
              <Search
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Sticky controls ──────────────────────────────────────────────── */}
      <div className="sticky top-16 z-10 bg-zeat-beige/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          {isSearching ? (
            /* Tabs: Restaurants | Plats */
            <div
              className="flex gap-1 py-2"
              role="tablist"
              aria-label="Type de résultats"
            >
              {([
                { id: "restaurants" as Tab, label: "Restaurants", count: restCount },
                { id: "plats" as Tab,       label: "Plats",       count: dishCount },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                    ${activeTab === tab.id
                      ? "bg-uber-black text-white"
                      : "text-body-gray hover:bg-chip-gray hover:text-uber-black"
                    }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none
                      ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-chip-gray text-muted-gray"}`}
                    aria-label={`${tab.count} résultats`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* Sort pills */
            <div
              className="flex gap-1.5 overflow-x-auto py-2 scrollbar-none"
              role="group"
              aria-label="Trier les restaurants"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  aria-pressed={sort === opt.key}
                  className={`shrink-0 rounded-full px-4 py-2 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                    ${sort === opt.key
                      ? "bg-uber-black text-white"
                      : "bg-chip-gray text-body-gray hover:bg-hover-gray hover:text-uber-black"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <main id="main-content" className="mx-auto max-w-3xl px-4 sm:px-8 py-8 pb-24">

        {/* ── Browse mode (no search) ─────────────────────────────────── */}
        {!isSearching && (
          <>
            {isLoadingRestaurants && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            )}

            {!isLoadingRestaurants && restaurants.length === 0 && (
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
                  className="inline-flex items-center gap-2 rounded-full bg-uber-black text-white font-bold px-7 py-3 text-caption hover:bg-body-gray transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Créer mon menu
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            )}

            {!isLoadingRestaurants && restaurants.length > 0 && (
              <>
                <p className="text-micro text-muted-gray mb-5">
                  {restaurants.length} restaurant{restaurants.length > 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRestaurants.map((r) => (
                    <RestaurantCard key={r._id} r={r} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Search mode ─────────────────────────────────────────────── */}
        {isSearching && (
          <>
            {/* Restaurants tab */}
            {activeTab === "restaurants" && (
              <>
                {isLoadingRestaurants && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                  </div>
                )}

                {!isLoadingRestaurants && filteredRestaurants.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-body font-semibold text-uber-black mb-1">
                      Aucun restaurant pour &laquo;&nbsp;{query}&nbsp;&raquo;
                    </p>
                    <p className="text-caption text-muted-gray">
                      Essayez de chercher dans les plats.
                    </p>
                    <button
                      onClick={() => setActiveTab("plats")}
                      className="mt-4 rounded-full bg-chip-gray text-uber-black font-medium px-5 py-2 text-caption hover:bg-hover-gray transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Voir les plats correspondants
                    </button>
                  </div>
                )}

                {!isLoadingRestaurants && filteredRestaurants.length > 0 && (
                  <>
                    <p className="text-micro text-muted-gray mb-5">
                      {filteredRestaurants.length} restaurant{filteredRestaurants.length > 1 ? "s" : ""} pour &laquo;&nbsp;{query}&nbsp;&raquo;
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRestaurants.map((r) => (
                        <RestaurantCard key={r._id} r={r} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Plats tab */}
            {activeTab === "plats" && (
              <>
                {isLoadingDishes && (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <DishSkeleton key={i} />)}
                  </div>
                )}

                {!isLoadingDishes && dishResults?.length === 0 && (
                  <div className="py-16 text-center">
                    <UtensilsCrossed size={28} className="text-muted-gray mx-auto mb-3" aria-hidden="true" />
                    <p className="text-body font-semibold text-uber-black mb-1">
                      Aucun plat pour &laquo;&nbsp;{query}&nbsp;&raquo;
                    </p>
                    <p className="text-caption text-muted-gray">
                      Essayez un autre mot.
                    </p>
                  </div>
                )}

                {!isLoadingDishes && dishResults && dishResults.length > 0 && (
                  <>
                    <p className="text-micro text-muted-gray mb-4">
                      {dishResults.length} plat{dishResults.length > 1 ? "s" : ""} pour &laquo;&nbsp;{query}&nbsp;&raquo;
                    </p>
                    <div className="space-y-3">
                      {dishResults.map((dish) => (
                        <DishRow key={dish._id} dish={dish} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-uber-black py-8 px-8 text-center">
        <Link
          href="/"
          className="font-heading text-[18px] font-bold text-white tracking-tighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
          translate="no"
        >
          Zeat
        </Link>
        <p className="text-micro text-muted-gray mt-2">Le menu. Distillé.</p>
      </footer>
    </div>
  );
}
