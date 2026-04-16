"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

export default function SearchClient() {
  const [query, setQuery] = useState("");

  // Only fire query when ≥ 2 chars
  const results = useQuery(
    api.search.dishes,
    query.trim().length >= 2 ? { q: query.trim() } : "skip"
  );

  const isSearching = query.trim().length >= 2;
  const isLoading = isSearching && results === undefined;

  return (
    <div className="min-h-screen bg-zeat-beige">
      {/* Nav */}
      <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-zeat-beige/90 backdrop-blur-xl px-6 sm:px-8 border-b border-border gap-4">
        <Link href="/" className="font-heading text-[22px] font-bold tracking-tighter text-uber-black shrink-0">
          Zeat
        </Link>
        <div className="relative flex-1 max-w-lg">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-gray" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Rechercher un plat, une description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-zeat pl-9 w-full"
            autoFocus
            aria-label="Rechercher un plat"
          />
        </div>
        <Link
          href="/restaurants"
          className="hidden sm:block shrink-0 text-caption font-medium text-body-gray hover:text-uber-black transition-colors"
        >
          Restaurants
        </Link>
      </nav>

      <div className="pt-24 pb-16 px-4 sm:px-8 mx-auto max-w-2xl">
        {/* Idle state */}
        {!isSearching && (
          <div className="text-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chip-gray mx-auto mb-5">
              <Search size={24} className="text-muted-gray" aria-hidden="true" />
            </div>
            <h1 className="text-headline-sm text-uber-black mb-2">Chercher un plat</h1>
            <p className="text-body text-muted-gray max-w-sm mx-auto">
              Tapez le nom d&apos;un plat ou d&apos;un ingrédient pour trouver où le commander.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {["Thiéboudienne", "Mafé", "Yassa", "Accras", "Bissap"].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="pill-chip text-caption hover:bg-chip-gray transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-whisper p-4 flex gap-4 animate-pulse">
                <div className="h-16 w-16 rounded-[var(--radius-lg)] bg-chip-gray shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-2/3 rounded-full bg-chip-gray" />
                  <div className="h-3 w-1/2 rounded-full bg-chip-gray" />
                  <div className="h-3 w-1/4 rounded-full bg-chip-gray" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {isSearching && !isLoading && results?.length === 0 && (
          <div className="text-center py-16">
            <UtensilsCrossed size={28} className="text-muted-gray mx-auto mb-3" aria-hidden="true" />
            <p className="text-body font-semibold text-uber-black mb-1">
              Aucun résultat pour &laquo;&nbsp;{query}&nbsp;&raquo;
            </p>
            <p className="text-caption text-muted-gray">Essayez un autre nom de plat ou d&apos;ingrédient.</p>
          </div>
        )}

        {/* Results */}
        {isSearching && !isLoading && results && results.length > 0 && (
          <>
            <p className="text-micro text-muted-gray mb-4">
              {results.length} résultat{results.length > 1 ? "s" : ""} pour &laquo;&nbsp;{query}&nbsp;&raquo;
            </p>
            <div className="space-y-3">
              {results.map((dish) => (
                <Link
                  key={dish._id}
                  href={`/m/${dish.restaurantSlug}`}
                  className="card-whisper p-4 flex items-center gap-4 group hover:shadow-[var(--shadow-medium)] transition-shadow"
                >
                  {/* Thumbnail */}
                  {dish.imageUrl ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-lg)]">
                      <Image
                        src={dish.imageUrl}
                        alt={dish.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-chip-gray">
                      <UtensilsCrossed size={18} className="text-muted-gray" aria-hidden="true" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-semibold text-uber-black group-hover:underline underline-offset-2">
                      {dish.name}
                    </p>
                    {dish.description && (
                      <p className="text-micro text-muted-gray mt-0.5 line-clamp-1">{dish.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-caption font-bold text-uber-black">{formatPrice(dish.price)}</span>
                      <span className="text-micro text-muted-gray">·</span>
                      <span className="text-micro text-muted-gray">{dish.restaurantName}</span>
                    </div>
                  </div>

                  <ArrowRight
                    size={16}
                    className="text-muted-gray shrink-0 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
