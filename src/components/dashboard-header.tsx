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
    <header className="flex h-16 items-center justify-between border-b border-border bg-pure-white px-8">
      <div>
        <h1 className="font-heading text-[20px] font-bold leading-tight text-uber-black">
          {title}
        </h1>
        {description && (
          <p className="text-micro text-muted-gray">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {restaurant && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-uber-black text-white text-micro font-bold">
            {restaurant.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
