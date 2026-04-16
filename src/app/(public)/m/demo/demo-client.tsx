"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Plus, Minus, X, ArrowRight, Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ── Demo data ──────────────────────────────────────────────────────────────────

const RESTAURANT = {
  name: "Chez Fatou",
  tagline: "Cuisine africaine · Dakar",
};

const CATEGORIES = ["Entrées", "Plats", "Desserts"];

const MENU: {
  name: string;
  category: string;
  price: number;
  description: string;
  tag?: string;
  image: string;
}[] = [
  {
    name: "Accras de Crevettes",
    category: "Entrées",
    price: 3500,
    description: "Beignets croustillants aux crevettes fraîches, sauce tartare maison.",
    tag: "Signature",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB8ZuMcVYxGYlENZ-GOO1mYoiFAsSVZwVS69N2I2eJMe95CdCaOySFI5TJfsLVZ8MMjvVoIQ5NXxTqBLqgpcDK0r7Vs6uPCuO9BMs776Ti3kL-cU41btUhqW6M7swbSzoR5Rt6g-I5nh4QG1J53zNyR57n8IoAui26jWfY6qhfVMlOmLUmQ7Odsiffhs09nr1fN-kL49pWKD0qjVP9eM4F1p6h0FnT2LRW-tX8P7n1bJcWJcb4Fv2H_PiY2TqZ74DFhuqmfIf4oGCMF",
  },
  {
    name: "Salade Avocat-Mangue",
    category: "Entrées",
    price: 2800,
    description: "Avocat crémeux, mangue fraîche, vinaigrette au gingembre et citron vert.",
    tag: "Végétarien",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAPXNXwj_6Zmu_W9MAcYIFdBXGnsTwjCTqMsjl9P3HQYDUn6HfNND5TKg_dHcM2uK--ULZ6BW_5NzW8bv8vnwceScKdcWpSPzHRQTUrF-0e7tezPhBw0jMO8saaT8W05f4nvO0aTry-ILCwIg7wZXr5h0prxTdeESeNWPyqrmasH2cY8IKgHJ9EALu3e3T5rUQ1dajuP3fo_lWe3SgtnqO3qcQ2GtUkVP8aLjTR8RuUOoNO3a5P5P3D42Bvv9lwWQUvkFBXRLmLdmZN",
  },
  {
    name: "Thiéboudienne",
    category: "Plats",
    price: 6500,
    description: "Riz au poisson sénégalais, légumes du marché, sauce tomate parfumée.",
    tag: "Best-seller",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmOopDuJaqG7-ErUuIUrGr5BzG2GJipKSQg8QC_OS2bc1XuPw51qShwH7DLQu5_4G60E9SNHNmOPgG3xlnuC7g8SKj-KjpRlD2xbBjZrp2G9uCLi2co5zPg_YIbFqKHxU_o3X6tu_-dxyAgXL8xks_X6wr_1BNFBYY8Rh_GWVZOV_cf3Y74xhNBAfScJ8hCycKFOv2Zf4lm8V6WTK2oxVNiZQ8Io8kXWdcawh4-t1l-T7gCssXKkZNxcki8_UouchG7Nutp0qkEt_C",
  },
  {
    name: "Mafé Poulet",
    category: "Plats",
    price: 5500,
    description: "Poulet mijoté dans une sauce d'arachide onctueuse, servi avec du riz blanc.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDW6OxE9k1V05PZoNBnqfNUpHS5GXMW_PWaG38_GE_x4uhv321AaQXkHmePiX87B-0pmR0-C5XT_JFK5g_RFb84h_qMnhGzOYi6_T7SxfX2s2d7YSjyEQskfEb1TkSdFsOONo23jKkSfNzGtimbcEjz0a6yFjz_VE5Rrw8wZJmqPRMaVZRzpXIKFR6y8uPD6jhfRyEIbdnDJd5jtJUNclsAvyo_9zAGPaMNj8_yheY99jBkhP27U0TPBoYuBOhsuu7CI0EwMnN1o9E6",
  },
  {
    name: "Yassa Agneau",
    category: "Plats",
    price: 7200,
    description: "Agneau confit aux oignons caramélisés, citron confit et moutarde.",
    tag: "Chef",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB8ZuMcVYxGYlENZ-GOO1mYoiFAsSVZwVS69N2I2eJMe95CdCaOySFI5TJfsLVZ8MMjvVoIQ5NXxTqBLqgpcDK0r7Vs6uPCuO9BMs776Ti3kL-cU41btUhqW6M7swbSzoR5Rt6g-I5nh4QG1J53zNyR57n8IoAui26jWfY6qhfVMlOmLUmQ7Odsiffhs09nr1fN-kL49pWKD0qjVP9eM4F1p6h0FnT2LRW-tX8P7n1bJcWJcb4Fv2H_PiY2TqZ74DFhuqmfIf4oGCMF",
  },
  {
    name: "Thiakry",
    category: "Desserts",
    price: 2000,
    description: "Crème de mil fermenté, lait caillé sucré, noix de coco râpée.",
    tag: "Végétarien",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAPXNXwj_6Zmu_W9MAcYIFdBXGnsTwjCTqMsjl9P3HQYDUn6HfNND5TKg_dHcM2uK--ULZ6BW_5NzW8bv8vnwceScKdcWpSPzHRQTUrF-0e7tezPhBw0jMO8saaT8W05f4nvO0aTry-ILCwIg7wZXr5h0prxTdeESeNWPyqrmasH2cY8IKgHJ9EALu3e3T5rUQ1dajuP3fo_lWe3SgtnqO3qcQ2GtUkVP8aLjTR8RuUOoNO3a5P5P3D42Bvv9lwWQUvkFBXRLmLdmZN",
  },
  {
    name: "Bissap Glacé",
    category: "Desserts",
    price: 1500,
    description: "Granité à l'hibiscus, zeste de gingembre, menthe fraîche.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDW6OxE9k1V05PZoNBnqfNUpHS5GXMW_PWaG38_GE_x4uhv321AaQXkHmePiX87B-0pmR0-C5XT_JFK5g_RFb84h_qMnhGzOYi6_T7SxfX2s2d7YSjyEQskfEb1TkSdFsOONo23jKkSfNzGtimbcEjz0a6yFjz_VE5Rrw8wZJmqPRMaVZRzpXIKFR6y8uPD6jhfRyEIbdnDJd5jtJUNclsAvyo_9zAGPaMNj8_yheY99jBkhP27U0TPBoYuBOhsuu7CI0EwMnN1o9E6",
  },
];

type CartItem = { name: string; price: number; quantity: number };

// ── Component ──────────────────────────────────────────────────────────────────

export default function DemoClient() {
  const [activeCategory, setActiveCategory] = useState("Entrées");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const addToCart = (item: { name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) return prev.map((i) => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} ajouté`);
  };

  const updateQty = (name: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.name === name ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0)
    );
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const visibleItems = MENU.filter((d) => d.category === activeCategory);

  return (
    <div className="min-h-screen bg-zeat-beige">
      {/* Demo banner */}
      <div className="bg-uber-black text-white text-center py-2.5 px-4">
        <p className="text-micro font-medium flex items-center justify-center gap-2">
          <Info size={13} aria-hidden="true" />
          Ceci est une démo — créez votre propre menu en{" "}
          <Link href="/signup" className="underline underline-offset-2 font-bold hover:no-underline">
            60 secondes
          </Link>
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-black/10 bg-zeat-beige px-6 pt-8 pb-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-uber-black text-white font-heading text-[20px] font-bold mb-4">
            C
          </div>
          <h1 className="text-headline-md text-uber-black">{RESTAURANT.name}</h1>
          <p className="text-caption text-muted-gray mt-1">{RESTAURANT.tagline}</p>
        </div>
      </header>

      {/* Hero image */}
      <div className="mx-auto max-w-2xl px-6 pt-6">
        <div className="relative h-52 w-full overflow-hidden rounded-[var(--radius-xl)]">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmOopDuJaqG7-ErUuIUrGr5BzG2GJipKSQg8QC_OS2bc1XuPw51qShwH7DLQu5_4G60E9SNHNmOPgG3xlnuC7g8SKj-KjpRlD2xbBjZrp2G9uCLi2co5zPg_YIbFqKHxU_o3X6tu_-dxyAgXL8xks_X6wr_1BNFBYY8Rh_GWVZOV_cf3Y74xhNBAfScJ8hCycKFOv2Zf4lm8V6WTK2oxVNiZQ8Io8kXWdcawh4-t1l-T7gCssXKkZNxcki8_UouchG7Nutp0qkEt_C"
            alt="Chez Fatou — restaurant africain à Dakar"
            fill
            sizes="(max-width: 720px) calc(100vw - 48px), 624px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>

      {/* Category nav */}
      <div className="sticky top-0 z-10 bg-zeat-beige/95 backdrop-blur-sm border-b border-black/10 mt-4">
        <div className="mx-auto max-w-2xl px-6">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`pill-chip shrink-0 text-caption transition-colors ${
                  activeCategory === cat ? "bg-uber-black text-white" : ""
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="mx-auto max-w-2xl px-6 py-6 space-y-3 pb-28">
        <h2 className="text-headline-sm text-uber-black mb-4">{activeCategory}</h2>

        {visibleItems.map((item) => {
          const inCart = cart.find((i) => i.name === item.name);
          return (
            <div
              key={item.name}
              className="overflow-hidden rounded-[var(--radius-lg)] bg-pure-white shadow-[var(--shadow-whisper)] group"
            >
              {/* Image */}
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 720px) calc(100vw - 48px), 624px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {item.tag && (
                  <span className="absolute top-3 left-3 rounded-full bg-uber-black text-white text-micro font-bold px-3 py-1">
                    {item.tag}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex items-end justify-between px-5 py-4">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-caption font-semibold text-uber-black">{item.name}</p>
                  <p className="text-micro text-muted-gray mt-0.5 line-clamp-2">{item.description}</p>
                  <p className="text-caption font-bold text-uber-black mt-2">{formatPrice(item.price)}</p>
                </div>
                <div className="shrink-0">
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.name, -1)}
                        aria-label={`Retirer un ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-chip-gray hover:bg-hover-gray transition-colors"
                      >
                        <Minus size={13} aria-hidden="true" />
                      </button>
                      <span className="text-caption font-bold w-5 text-center" aria-live="polite">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQty(item.name, 1)}
                        aria-label={`Ajouter un ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-uber-black text-white hover:bg-body-gray transition-colors"
                      >
                        <Plus size={13} aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      aria-label={`Ajouter ${item.name} au panier`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-uber-black text-white hover:bg-body-gray transition-colors shadow-[var(--shadow-float)]"
                    >
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-6 z-20">
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Voir le panier — ${itemCount} article${itemCount > 1 ? "s" : ""}`}
            className="flex items-center gap-3 rounded-full bg-uber-black text-white px-6 py-4 shadow-[var(--shadow-medium)] hover:bg-body-gray transition-colors"
          >
            <ShoppingCart size={18} aria-hidden="true" />
            <span className="font-bold text-caption">
              {itemCount} article{itemCount > 1 ? "s" : ""}
            </span>
            <span className="font-bold text-caption" aria-hidden="true">·</span>
            <span className="font-bold text-caption">{formatPrice(total)}</span>
          </button>
        </div>
      )}

      {/* Cart sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="bottom" className="rounded-t-[var(--radius-xl)] max-h-[80vh] overflow-y-auto bg-pure-white">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-heading text-[20px] font-bold">Mon panier</SheetTitle>
          </SheetHeader>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-semibold text-uber-black">{item.name}</p>
                  <p className="text-micro text-muted-gray">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.name, -1)} aria-label={`Retirer un ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-chip-gray hover:bg-hover-gray">
                    <Minus size={13} aria-hidden="true" />
                  </button>
                  <span className="text-caption font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.name, 1)} aria-label={`Ajouter un ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-uber-black text-white hover:bg-body-gray">
                    <Plus size={13} aria-hidden="true" />
                  </button>
                  <button onClick={() => updateQty(item.name, -item.quantity)} aria-label={`Supprimer ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 text-muted-gray hover:text-red-500 ml-1">
                    <X size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between py-3 border-t border-border">
            <span className="text-caption font-semibold">Total</span>
            <span className="font-heading text-[20px] font-bold">{formatPrice(total)}</span>
          </div>
          <Button
            onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
            className="w-full mt-4 rounded-full bg-uber-black text-white font-bold py-3 hover:bg-body-gray"
          >
            Commander <ArrowRight size={16} className="ml-2" aria-hidden="true" />
          </Button>
        </SheetContent>
      </Sheet>

      {/* Checkout demo sheet */}
      <Sheet open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <SheetContent side="bottom" className="rounded-t-[var(--radius-xl)] max-h-[85vh] overflow-y-auto bg-pure-white">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-heading text-[20px] font-bold">Votre commande</SheetTitle>
          </SheetHeader>

          <div className="mb-5 flex items-start gap-3 rounded-[var(--radius-lg)] bg-chip-gray px-4 py-3">
            <Info size={15} className="text-muted-gray shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-micro text-body-gray">
              Démo interactive — la commande ne sera pas envoyée.{" "}
              <Link href="/signup" className="font-semibold text-uber-black underline underline-offset-2">
                Créez votre menu pour de vrai →
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="demo-name" className="text-caption font-medium">Votre prénom *</Label>
              <Input id="demo-name" name="given-name" autoComplete="given-name" placeholder="Ex : Aminata…" className="input-zeat" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="demo-phone" className="text-caption font-medium">
                Téléphone <span className="text-muted-gray">(optionnel)</span>
              </Label>
              <Input id="demo-phone" name="tel" type="tel" autoComplete="tel" placeholder="Ex : +221 77 000 00 00" className="input-zeat" />
            </div>
            <div className="rounded-[var(--radius-lg)] bg-chip-gray px-4 py-3 flex items-center justify-between">
              <span className="text-caption font-medium text-uber-black">{itemCount} article{itemCount > 1 ? "s" : ""}</span>
              <span className="font-heading text-[20px] font-bold text-uber-black">{formatPrice(total)}</span>
            </div>
            <Button
              onClick={() => {
                setCheckoutOpen(false);
                setCart([]);
                toast.success("Démo : commande simulée avec succès !");
              }}
              className="w-full rounded-full bg-uber-black text-white font-bold py-3 hover:bg-body-gray"
            >
              Simuler la commande
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
