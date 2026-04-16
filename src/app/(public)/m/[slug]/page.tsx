import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import MenuClient from "./menu-client";

// Revalidate the server-rendered shell every 60 s (ISR).
// The client takes over with live Convex subscriptions after hydration.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const restaurant = await fetchQuery(api.restaurants.getBySlug, { slug });
    if (!restaurant) {
      return {
        title: "Menu introuvable",
        robots: { index: false },
      };
    }
    return {
      title: restaurant.name,
      description: `Découvrez le menu de ${restaurant.name} et passez commande directement depuis votre téléphone.`,
      openGraph: {
        title: `Menu — ${restaurant.name}`,
        description: `Parcourez le menu de ${restaurant.name} et commandez en ligne.`,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: `Menu — ${restaurant.name}`,
        description: `Commandez en ligne chez ${restaurant.name}.`,
      },
    };
  } catch {
    return { title: "Menu" };
  }
}

export default function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <MenuClient params={params} />;
}
