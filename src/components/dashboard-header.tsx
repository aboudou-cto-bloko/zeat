"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({ title, description, actions }: DashboardHeaderProps) {
  const restaurant = useQuery(api.restaurants.getCurrent);

  return (
    <header className="flex min-h-16 items-center justify-between border-b border-border bg-pure-white px-4 sm:px-8 py-3 gap-3">
      <div className="min-w-0">
        <h1 className="font-heading text-[18px] sm:text-[20px] font-bold leading-tight text-uber-black truncate">
          {title}
        </h1>
        {description && (
          <p className="text-micro text-muted-gray hidden sm:block">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {restaurant && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-uber-black text-white text-micro font-bold shrink-0">
            {restaurant.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
