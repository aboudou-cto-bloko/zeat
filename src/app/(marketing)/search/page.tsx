import type { Metadata } from "next";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "Rechercher un plat",
  description:
    "Recherchez un plat ou un ingrédient et trouvez le restaurant qui le propose sur Zeat.",
  robots: { index: false },
};

export default function SearchPage() {
  return <SearchClient />;
}
