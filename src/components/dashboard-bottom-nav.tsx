"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",        label: "Accueil",    icon: LayoutDashboard },
  { href: "/dashboard/menu",   label: "Menu",       icon: UtensilsCrossed },
  { href: "/dashboard/orders", label: "Commandes",  icon: ClipboardList   },
];

export function DashboardBottomNav() {
  const pathname = usePathname();

  return (
    /* Floating pill — centered, not full-width */
    <nav
      className="fixed bottom-4 left-0 right-0 flex justify-center z-50 px-4 lg:hidden"
      aria-label="Navigation principale"
    >
      <div className="flex items-center gap-1 rounded-[28px] bg-pure-white/90 backdrop-blur-xl px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.04]">
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
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // base tab shape
                "relative flex items-center gap-2 rounded-[20px] px-4 py-2.5",
                // smooth bg+color transition (ease, 180ms)
                "transition-[background-color,color] duration-[180ms] ease-[cubic-bezier(.165,.84,.44,1)]",
                isActive
                  ? "bg-uber-black text-white"
                  : "text-muted-gray hover:text-body-gray"
              )}
            >
              <Icon
                size={18}
                aria-hidden="true"
                className={cn(
                  // icon scale: ease-out-quart 180ms
                  "transition-transform duration-[180ms] ease-[cubic-bezier(.165,.84,.44,1)]",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-[12px] font-semibold leading-none",
                  // label appears/disappears: width + opacity
                  "transition-[opacity,max-width] duration-[180ms] ease-[cubic-bezier(.165,.84,.44,1)] overflow-hidden whitespace-nowrap",
                  isActive ? "opacity-100 max-w-[80px]" : "opacity-0 max-w-0"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
