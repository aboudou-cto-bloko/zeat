import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center bg-zeat-beige">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-uber-black text-white">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="text-headline-md text-uber-black mb-2">Commande envoyée !</h1>
      <p className="text-body text-muted-gray max-w-xs">
        Le restaurant a bien reçu votre commande et va la préparer.
      </p>
      <Link
        href="javascript:history.back()"
        className="mt-8 rounded-full border border-uber-black px-6 py-3 text-caption font-bold text-uber-black hover:bg-chip-gray transition-colors"
      >
        Retour au menu
      </Link>
    </div>
  );
}
