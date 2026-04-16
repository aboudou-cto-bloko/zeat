"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UtensilsCrossed, ClipboardList, ExternalLink, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const restaurant = useQuery(api.restaurants.getCurrent);
  const orders = useQuery(api.orders.listByRestaurant);
  const categories = useQuery(
    api.categories.list,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );
  const dishes = useQuery(
    api.dishes.listByRestaurant,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  const pendingOrders = orders?.filter((o) => o.status === "pending").length ?? 0;

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title={restaurant ? `Bonjour 👋` : "Dashboard"}
        description={restaurant?.name}
      />

      <div className="p-4 sm:p-8 space-y-5 sm:space-y-8">
        {/* Welcome empty state */}
        {categories !== undefined && categories.length === 0 && (
          <div className="card-whisper p-8 sm:p-10 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-chip-gray">
              <UtensilsCrossed size={24} className="text-uber-black" />
            </div>
            <h2 className="text-headline-sm text-uber-black mb-2">
              Créez votre premier menu
            </h2>
            <p className="text-body text-muted-gray max-w-sm mb-6">
              Ajoutez des catégories et des plats pour que vos clients puissent passer commande.
            </p>
            <Link href="/dashboard/menu">
              <Button className="rounded-full bg-uber-black text-white font-bold px-6 hover:bg-body-gray">
                Ajouter une catégorie
                <ArrowRight size={16} className="ml-2" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        )}

        {/* Stats row */}
        {(categories?.length ?? 0) > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              label="Catégories"
              value={categories?.length ?? 0}
              icon={<UtensilsCrossed size={18} />}
              href="/dashboard/menu"
            />
            <StatCard
              label="Plats"
              value={dishes?.length ?? 0}
              icon={<UtensilsCrossed size={18} />}
              href="/dashboard/menu"
            />
            <StatCard
              label="En attente"
              value={pendingOrders}
              icon={<ClipboardList size={18} />}
              href="/dashboard/orders"
              highlight={pendingOrders > 0}
            />
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link href="/dashboard/menu">
            <div className="card-whisper p-5 sm:p-6 flex items-center justify-between hover:shadow-medium transition-shadow cursor-pointer group">
              <div>
                <p className="text-caption font-semibold text-uber-black">Gérer le menu</p>
                <p className="text-micro text-muted-gray mt-0.5">
                  {categories?.length ?? 0} catégorie{(categories?.length ?? 0) > 1 ? "s" : ""} · {dishes?.length ?? 0} plat{(dishes?.length ?? 0) > 1 ? "s" : ""}
                </p>
              </div>
              <ArrowRight size={18} className="text-muted-gray group-hover:text-uber-black transition-colors shrink-0 ml-4" aria-hidden="true" />
            </div>
          </Link>

          <Link href="/dashboard/orders">
            <div className="card-whisper p-5 sm:p-6 flex items-center justify-between hover:shadow-medium transition-shadow cursor-pointer group">
              <div>
                <p className="text-caption font-semibold text-uber-black">Voir les commandes</p>
                <p className="text-micro text-muted-gray mt-0.5">
                  {pendingOrders > 0 ? `${pendingOrders} en attente` : "Aucune en attente"}
                </p>
              </div>
              <ArrowRight size={18} className="text-muted-gray group-hover:text-uber-black transition-colors shrink-0 ml-4" aria-hidden="true" />
            </div>
          </Link>
        </div>

        {/* Public link */}
        {restaurant && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-[var(--radius-lg)] border border-border px-5 sm:px-6 py-4">
            <div className="min-w-0">
              <p className="text-caption font-semibold text-uber-black">Lien public du menu</p>
              <p className="text-micro text-muted-gray font-mono mt-0.5 truncate">
                /m/{restaurant.slug}
              </p>
            </div>
            <a
              href={`/m/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="outline" className="w-full sm:w-auto rounded-full text-caption font-medium border-uber-black gap-2">
                <ExternalLink size={14} aria-hidden="true" />
                Ouvrir
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`card-whisper p-4 sm:p-6 hover:shadow-medium transition-shadow ${
          highlight ? "border border-uber-black" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full ${highlight ? "bg-uber-black text-white" : "bg-chip-gray text-uber-black"}`}>
            {icon}
          </div>
        </div>
        <p className="font-heading text-[22px] sm:text-[28px] font-bold text-uber-black leading-none">{value}</p>
        <p className="text-micro text-muted-gray mt-1 leading-tight">{label}</p>
      </div>
    </Link>
  );
}
