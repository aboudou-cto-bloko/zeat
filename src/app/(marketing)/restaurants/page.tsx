import type { Metadata } from "next";
import RestaurantsClient from "./restaurants-client";

export const metadata: Metadata = {
  title: "Explorer les menus",
  description:
    "Découvrez les restaurants sur Zeat, recherchez vos plats préférés et passez commande directement — sans commission.",
  openGraph: {
    title: "Explorer les menus | Zeat",
    description:
      "Tous les restaurants Zeat en un seul endroit. Recherchez un plat, un restaurant, et commandez sans plateforme.",
  },
};

export default function RestaurantsPage() {
  return <RestaurantsClient />;
}
