"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { ShoppingCart, Plus, Minus, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type CartItem = {
  dishId: Id<"dishes">;
  dishName: string;
  unitPrice: number;
  quantity: number;
};

export default function MenuClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const restaurant = useQuery(api.restaurants.getBySlug, { slug });
  const categories = useQuery(
    api.categories.list,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );
  const dishes = useQuery(
    api.dishes.listByRestaurant,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  const createOrder = useMutation(api.orders.create);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    note: "",
  });
  const [ordering, setOrdering] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const addToCart = (dish: { _id: Id<"dishes">; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.dishId === dish._id);
      if (existing) {
        return prev.map((i) =>
          i.dishId === dish._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { dishId: dish._id, dishName: dish.name, unitPrice: dish.price, quantity: 1 },
      ];
    });
    toast.success(`${dish.name} ajouté`);
  };

  const updateQty = (dishId: Id<"dishes">, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.dishId === dishId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleOrder = async () => {
    if (!checkoutForm.name.trim()) {
      toast.error("Veuillez indiquer votre prénom");
      return;
    }
    if (!restaurant) return;
    setOrdering(true);
    try {
      await createOrder({
        restaurantId: restaurant._id,
        customerName: checkoutForm.name.trim(),
        customerPhone: checkoutForm.phone || undefined,
        note: checkoutForm.note || undefined,
        items: cart,
        total,
      });

      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      router.push("/confirmation");
    } catch {
      toast.error("Erreur lors de la commande, réessayez.");
    } finally {
      setOrdering(false);
    }
  };

  const getActiveDishes = (categoryId: Id<"categories">) =>
    (dishes ?? []).filter((d) => d.categoryId === categoryId && d.available);

  if (restaurant === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-uber-black border-t-transparent" />
      </div>
    );
  }

  if (restaurant === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-headline-sm text-uber-black">Menu introuvable</p>
        <p className="text-body text-muted-gray">Ce lien ne correspond à aucun restaurant.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zeat-beige">
      {/* Hero */}
      <header className="border-b border-black/10 bg-zeat-beige">
        {/* Banner */}
        {restaurant.bannerUrl && (
          <div className="relative w-full h-[180px] sm:h-[240px] overflow-hidden">
            <Image
              src={restaurant.bannerUrl}
              alt={`Bannière — ${restaurant.name}`}
              fill
              sizes="(max-width: 640px) 100vw, 672px"
              className="object-cover"
              priority
            />
            {/* Gradient overlay so text below stays readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zeat-beige/80" />
          </div>
        )}

        {/* Logo + name */}
        <div className="mx-auto max-w-2xl px-6 pb-6" style={{ marginTop: restaurant.bannerUrl ? "-2.5rem" : undefined, paddingTop: restaurant.bannerUrl ? undefined : "2rem" }}>
          {restaurant.logoUrl ? (
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-4 border-zeat-beige shadow-[var(--shadow-whisper)] mb-4">
              <Image
                src={restaurant.logoUrl}
                alt={`Logo — ${restaurant.name}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-uber-black text-white font-heading text-[22px] sm:text-[26px] font-bold mb-4 border-4 border-zeat-beige">
              {restaurant.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-headline-sm sm:text-headline-md text-uber-black">{restaurant.name}</h1>
          {restaurant.description ? (
            <p className="text-caption text-muted-gray mt-1">{restaurant.description}</p>
          ) : (
            <p className="text-caption text-muted-gray mt-1">Menu digital</p>
          )}
        </div>
      </header>

      {/* Category nav */}
      {categories && categories.length > 0 && (
        <div className="sticky top-0 z-10 bg-zeat-beige/90 backdrop-blur-sm border-b border-black/10">
          <div className="mx-auto max-w-2xl px-6">
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
              <button
                onClick={() => setActiveCategory(null)}
                className={`pill-chip shrink-0 text-caption transition-colors ${
                  activeCategory === null ? "bg-uber-black text-white" : ""
                }`}
              >
                Tout
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat._id)}
                  className={`pill-chip shrink-0 text-caption transition-colors ${
                    activeCategory === cat._id ? "bg-uber-black text-white" : ""
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu content */}
      <div className="mx-auto max-w-2xl px-6 py-6 space-y-8 pb-28">
        {categories
          ?.filter((cat) => activeCategory === null || cat._id === activeCategory)
          .map((cat) => {
            const catDishes = getActiveDishes(cat._id);
            if (catDishes.length === 0) return null;
            return (
              <section key={cat._id}>
                <h2 className="text-headline-sm text-uber-black mb-4">{cat.name}</h2>
                <div className="space-y-3">
                  {catDishes.map((dish) => {
                    const inCart = cart.find((i) => i.dishId === dish._id);
                    const controls = inCart ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(dish._id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-chip-gray hover:bg-hover-gray transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-caption font-bold w-5 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(dish._id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-uber-black text-white hover:bg-body-gray transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(dish)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-uber-black text-white hover:bg-body-gray transition-colors shadow-[var(--shadow-float)]"
                      >
                        <Plus size={16} />
                      </button>
                    );

                    if (dish.imageUrl) {
                      return (
                        <div
                          key={dish._id}
                          className="overflow-hidden rounded-[var(--radius-lg)] bg-pure-white shadow-[var(--shadow-whisper)] group"
                        >
                          <div className="relative h-44 w-full overflow-hidden">
                            <Image
                              src={dish.imageUrl}
                              alt={dish.name}
                              fill
                              sizes="(max-width: 720px) calc(100vw - 48px), 624px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex items-end justify-between px-5 py-4">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-caption font-semibold text-uber-black">{dish.name}</p>
                              {dish.description && (
                                <p className="text-micro text-muted-gray mt-0.5 line-clamp-2">
                                  {dish.description}
                                </p>
                              )}
                              <p className="text-caption font-bold text-uber-black mt-2">
                                {formatPrice(dish.price)}
                              </p>
                            </div>
                            <div className="shrink-0">{controls}</div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={dish._id}
                        className="flex items-center justify-between rounded-[var(--radius-lg)] bg-pure-white px-5 py-4 shadow-[var(--shadow-whisper)]"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-caption font-semibold text-uber-black">{dish.name}</p>
                          {dish.description && (
                            <p className="text-micro text-muted-gray mt-0.5 line-clamp-2">
                              {dish.description}
                            </p>
                          )}
                          <p className="text-caption font-bold text-uber-black mt-1.5">
                            {formatPrice(dish.price)}
                          </p>
                        </div>
                        <div className="shrink-0">{controls}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

        {categories?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-body text-muted-gray">Le menu n&apos;est pas encore disponible.</p>
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-6 z-20">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 rounded-full bg-uber-black text-white px-6 py-4 shadow-[var(--shadow-medium)] hover:bg-body-gray transition-colors"
          >
            <ShoppingCart size={18} />
            <span className="font-bold text-caption">
              {itemCount} article{itemCount > 1 ? "s" : ""}
            </span>
            <span className="font-bold text-caption">·</span>
            <span className="font-bold text-caption">{formatPrice(total)}</span>
          </button>
        </div>
      )}

      {/* Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="bottom" className="rounded-t-[var(--radius-xl)] max-h-[80vh] overflow-y-auto bg-pure-white">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-heading text-[20px] font-bold">Mon panier</SheetTitle>
          </SheetHeader>
          <div className="space-y-3">
            {cart.map((item) => {
              const imageUrl = dishes?.find((d) => d._id === item.dishId)?.imageUrl ?? null;
              return (
              <div key={item.dishId} className="flex items-center gap-3 py-3 border-b border-border">
                {imageUrl && (
                  <div className="relative h-12 w-12 shrink-0 rounded-[var(--radius-md)] overflow-hidden">
                    <Image src={imageUrl} alt={item.dishName} fill sizes="48px" className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-caption font-semibold text-uber-black">{item.dishName}</p>
                  <p className="text-micro text-muted-gray">{formatPrice(item.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.dishId, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-chip-gray hover:bg-hover-gray"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-caption font-bold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.dishId, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-uber-black text-white hover:bg-body-gray"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    onClick={() => updateQty(item.dishId, -item.quantity)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 text-muted-gray hover:text-red-500 ml-1"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between py-3 border-t border-border">
            <span className="text-caption font-semibold">Total</span>
            <span className="font-heading text-[20px] font-bold">{formatPrice(total)}</span>
          </div>
          <Button
            onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
            className="w-full mt-4 rounded-full bg-uber-black text-white font-bold py-3 hover:bg-body-gray"
          >
            Commander
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </SheetContent>
      </Sheet>

      {/* Checkout Sheet */}
      <Sheet open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <SheetContent side="bottom" className="rounded-t-[var(--radius-xl)] max-h-[85vh] overflow-y-auto bg-pure-white">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-heading text-[20px] font-bold">Votre commande</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">Votre prénom *</Label>
              <Input
                placeholder="Ex : Aminata"
                value={checkoutForm.name}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                className="input-zeat"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">
                Téléphone <span className="text-muted-gray">(optionnel)</span>
              </Label>
              <Input
                placeholder="Ex : +221 77 000 00 00"
                value={checkoutForm.phone}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                className="input-zeat"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">
                Note <span className="text-muted-gray">(optionnel)</span>
              </Label>
              <Input
                placeholder="Ex : sans oignon, à emporter…"
                value={checkoutForm.note}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, note: e.target.value })}
                className="input-zeat"
              />
            </div>

            <div className="rounded-[var(--radius-lg)] bg-chip-gray px-4 py-3 flex items-center justify-between">
              <span className="text-caption font-medium text-uber-black">
                {itemCount} article{itemCount > 1 ? "s" : ""}
              </span>
              <span className="font-heading text-[20px] font-bold text-uber-black">
                {formatPrice(total)}
              </span>
            </div>

            <Button
              onClick={handleOrder}
              disabled={ordering}
              className="w-full rounded-full bg-uber-black text-white font-bold py-3 hover:bg-body-gray"
            >
              {ordering ? "Envoi en cours…" : "Confirmer la commande"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
