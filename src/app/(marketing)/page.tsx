import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Link2, ClipboardList } from "lucide-react";

export const metadata: Metadata = {
  title: "Zeat — Le menu. Distillé.",
  description:
    "Créez votre menu digital en 60 secondes. Partagez le lien à vos clients et recevez les commandes directement — sans commission ni plateforme.",
  openGraph: {
    title: "Zeat — Votre menu digital. En 60 secondes.",
    description:
      "Créez votre menu, partagez le lien, recevez les commandes. Zéro commission. Zéro plateforme.",
    url: "/",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-pure-white">
      {/* Nav */}
      <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-pure-white/90 backdrop-blur-xl px-8 border-b border-border">
        <span className="font-heading text-[22px] font-bold tracking-tighter text-uber-black">
          Zeat
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/restaurants"
            className="hidden sm:block text-caption font-medium text-body-gray hover:text-uber-black transition-colors px-3 py-1.5"
          >
            Explorer
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="rounded-full text-caption font-medium text-body-gray hover:text-uber-black">
              Connexion
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full bg-uber-black text-white font-bold px-5 text-caption hover:bg-body-gray">
              Créer mon menu
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-chip-gray px-4 py-2 text-micro font-medium text-body-gray mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-uber-black" />
            Zéro commission · Zéro plateforme
          </div>
          <h1 className="text-display text-uber-black mb-6 tracking-tight">
            Votre menu digital.<br />
            <span className="text-muted-gray">En 60 secondes.</span>
          </h1>
          <p className="text-body text-body-gray max-w-xl mx-auto mb-10">
            Créez votre menu en ligne, partagez le lien à vos clients et recevez les commandes directement — sans dépendre des plateformes de livraison.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/signup">
              <Button className="rounded-full bg-uber-black text-white font-bold px-8 py-3 text-body hover:bg-body-gray gap-2">
                Créer mon menu gratuitement
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/m/demo" target="_blank">
              <Button variant="outline" className="rounded-full border-border text-caption font-medium text-body-gray hover:border-uber-black hover:text-uber-black px-6 py-3">
                Voir un exemple
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-zeat-beige py-20 px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-headline-md text-uber-black text-center mb-12">
            Tout ce dont vous avez besoin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap size={20} />,
                title: "Rapide à créer",
                desc: "Ajoutez vos catégories et plats en quelques clics. Votre menu est en ligne immédiatement.",
              },
              {
                icon: <Link2 size={20} />,
                title: "Lien unique",
                desc: "Chaque restaurant obtient une URL publique personnalisée à partager par WhatsApp, Instagram ou SMS.",
              },
              {
                icon: <ClipboardList size={20} />,
                title: "Commandes directes",
                desc: "Vos clients passent commande depuis leur téléphone. Vous recevez la commande par email instantanément.",
              },
            ].map((f) => (
              <div key={f.title} className="card-whisper p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-uber-black text-white mb-4">
                  {f.icon}
                </div>
                <h3 className="text-caption font-semibold text-uber-black mb-2">{f.title}</h3>
                <p className="text-micro text-muted-gray leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-headline-md text-uber-black mb-4">
            Prêt à digitaliser votre restaurant ?
          </h2>
          <p className="text-body text-body-gray mb-8">
            Gratuit. Sans carte bancaire. Sans commission.
          </p>
          <Link href="/signup">
            <Button className="rounded-full bg-uber-black text-white font-bold px-10 py-4 text-body hover:bg-body-gray gap-2">
              Commencer maintenant
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-uber-black py-8 px-8 text-center">
        <span className="font-heading text-[18px] font-bold text-white tracking-tighter">
          Zeat
        </span>
        <p className="text-micro text-muted-gray mt-2">Le menu. Distillé.</p>
      </footer>
    </div>
  );
}
