"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  LogOut,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/orders", label: "Commandes", icon: ClipboardList },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const restaurant = useQuery(api.restaurants.getCurrent);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-pure-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="font-heading text-[22px] font-bold tracking-tighter text-uber-black">
          Zeat
        </span>
      </div>

      {/* Restaurant name */}
      {restaurant && (
        <div className="px-6 py-4 border-b border-border">
          <p className="text-micro text-muted-gray uppercase tracking-widest mb-0.5">Restaurant</p>
          <p className="text-caption font-semibold text-uber-black truncate">{restaurant.name}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-caption font-medium transition-colors",
                isActive
                  ? "bg-uber-black text-pure-white"
                  : "text-body-gray hover:bg-chip-gray hover:text-uber-black"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-border px-3 py-4 space-y-1">
        {restaurant && (
          <a
            href={`/m/${restaurant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-caption font-medium text-body-gray hover:bg-chip-gray hover:text-uber-black transition-colors"
          >
            <ExternalLink size={16} />
            Voir mon menu public
          </a>
        )}
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-caption font-medium text-body-gray hover:bg-chip-gray hover:text-uber-black transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
