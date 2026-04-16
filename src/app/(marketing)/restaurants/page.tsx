import type { Metadata } from "next";
import RestaurantsClient from "./restaurants-client";

export const metadata: Metadata = {
  title: "Explorer les restaurants",
  description:
    "Découvrez tous les restaurants qui utilisent Zeat et passez commande directement depuis leur menu digital.",
  openGraph: {
    title: "Explorer les restaurants | Zeat",
    description:
      "Découvrez les menus des restaurants sur Zeat et commandez en ligne sans commission.",
  },
};

export default function RestaurantsPage() {
  return <RestaurantsClient />;
}
