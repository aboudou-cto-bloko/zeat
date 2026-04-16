import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { PwaProvider } from "@/components/providers/pwa-provider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://zeat.vercel.app"
  ),
  title: {
    default: "Zeat — Le menu. Distillé.",
    template: "%s | Zeat",
  },
  description:
    "Créez votre menu digital en 60 secondes. Partagez le lien, recevez les commandes directement — sans commission, sans plateforme.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Zeat",
    title: "Zeat — Le menu. Distillé.",
    description:
      "Créez votre menu digital en 60 secondes. Partagez le lien, recevez les commandes directement.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Zeat" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeat — Le menu. Distillé.",
    description:
      "Créez votre menu digital en 60 secondes. Sans commission, sans plateforme.",
    images: ["/og-image.svg"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zeat",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakarta.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen bg-background antialiased" suppressHydrationWarning>
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <PwaProvider />
            {children}
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
