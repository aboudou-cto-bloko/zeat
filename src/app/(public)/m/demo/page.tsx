import type { Metadata } from "next";
import DemoClient from "./demo-client";

export const metadata: Metadata = {
  title: "Démo — Chez Fatou",
  description:
    "Découvrez un exemple de menu digital Zeat avec le restaurant fictif Chez Fatou. Cuisine africaine, commandes en ligne, zéro commission.",
  openGraph: {
    title: "Démo menu digital — Chez Fatou | Zeat",
    description:
      "Parcourez un menu interactif exemple et voyez comment vos clients commanderont depuis leur téléphone.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Démo menu digital — Chez Fatou | Zeat",
    description: "Parcourez un menu interactif exemple.",
  },
};

export default function DemoPage() {
  return <DemoClient />;
}
