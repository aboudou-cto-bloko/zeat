Voici une implémentation complète de l'application Zeat avec Next.js (App Router), Tailwind CSS, Shadcn/ui et une charte graphique stricte "Uber Noir & Beige". Le code inclut la configuration, les layouts, toutes les pages demandées et les composants réutilisables.

---

## Structure du projet

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx                    # Landing
│   ├── (auth)/
│   │   └── signup/
│   │       └── page.tsx                # Inscription
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Dashboard vide
│   │   │   ├── menu/
│   │   │   │   └── page.tsx            # Gestion catégories + plats
│   │   │   └── orders/
│   │   │       └── page.tsx            # Gestion des commandes
│   ├── (public)/
│   │   ├── menu/[slug]/
│   │   │   └── page.tsx                # Menu public (beige)
│   │   ├── cart/
│   │   │   └── page.tsx                # Panier / Checkout
│   │   └── confirmation/
│   │       └── page.tsx                # Confirmation
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                             # Composants Shadcn
│   ├── marketing-navbar.tsx
│   ├── dashboard-sidebar.tsx
│   ├── dashboard-header.tsx
│   ├── public-menu-header.tsx
│   └── ...
├── lib/
│   └── utils.ts
└── tailwind.config.ts
```

---

## 1. Configuration Tailwind et Thème

### `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Uber Noir System
        "uber-black": "#000000",
        "pure-white": "#ffffff",
        "body-gray": "#4b4b4b",
        "muted-gray": "#afafaf",
        "chip-gray": "#efefef",
        "hover-gray": "#e2e2e2",
        "hover-light": "#f3f3f3",
        // Zeat Beige Accent
        "zeat-beige": "#F5F0EB",
        // Shadcn UI overrides
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#000000",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#5e5e5e",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f4f3f3",
          foreground: "#474747",
        },
        accent: {
          DEFAULT: "#F5F0EB",
          foreground: "#1a1c1c",
        },
        destructive: {
          DEFAULT: "#ba1a1a",
          foreground: "#ffffff",
        },
        border: "#e3e2e2",
        input: "#000000",
        ring: "#000000",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
        pill: "9999px",
      },
      fontFamily: {
        headline: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        body: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        whisper: "0 4px 16px rgba(0,0,0,0.12)",
        medium: "0 4px 16px rgba(0,0,0,0.16)",
        float: "0 2px 8px rgba(0,0,0,0.16)",
        pressed: "inset 0 0 0 1px rgba(0,0,0,0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

---

## 2. Styles globaux

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 0%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 0%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 0%;
    --primary: 0 0% 0%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 37%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 28%;
    --accent: 30 38% 94%;
    --accent-foreground: 0 0% 0%;
    --destructive: 0 84% 42%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 89%;
    --input: 0 0% 0%;
    --ring: 0 0% 0%;
    --radius: 1rem;
  }

  .dark {
    /* Optionnel - non utilisé dans Zeat */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-body antialiased;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-headline font-bold tracking-tight;
  }
}

@layer utilities {
  /* Typographie UberMove simulée */
  .text-display {
    @apply font-headline text-[52px] leading-[1.23] font-bold;
  }
  .text-headline-lg {
    @apply font-headline text-[36px] leading-[1.22] font-bold;
  }
  .text-headline-md {
    @apply font-headline text-[32px] leading-[1.25] font-bold;
  }
  .text-headline-sm {
    @apply font-headline text-[24px] leading-[1.33] font-bold;
  }
  .text-nav-large {
    @apply font-body text-[18px] leading-[1.33] font-medium;
  }
  .text-body {
    @apply font-body text-[16px] leading-[1.5] font-normal;
  }
  .text-caption {
    @apply font-body text-[14px] leading-[1.43] font-medium;
  }
  .text-micro {
    @apply font-body text-[12px] leading-[1.67] font-normal;
  }

  /* Composants personnalisés */
  .pill-button {
    @apply rounded-full px-6 py-3 font-bold transition-all duration-200;
  }
  .pill-chip {
    @apply rounded-full bg-chip-gray px-6 py-3.5 text-uber-black font-medium;
  }
  .card-whisper {
    @apply bg-pure-white rounded-lg shadow-whisper;
  }
  .input-uber {
    @apply rounded-lg border border-uber-black bg-pure-white px-4 py-3 text-uber-black placeholder:text-muted-gray focus:outline-none focus:ring-2 focus:ring-uber-black/20;
  }
}
```

---

## 3. Layout racine

### `src/app/layout.tsx`

```tsx
import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Manrope } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["700", "800"],
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "Zeat - Le Menu. Distillé.",
  description: "Plateforme de menus digitaux pour restaurateurs indépendants.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} ${manrope.variable}`}>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        {children}
      </body>
    </html>
  )
}
```

---

## 4. Composants Shadcn nécessaires

Exécutez `npx shadcn@latest add button input card label separator sheet dialog table` pour générer les composants dans `@/components/ui`.

---

## 5. Layouts par groupe de routes

### `src/app/(marketing)/layout.tsx`

```tsx
import { MarketingNavbar } from "@/components/marketing-navbar"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MarketingNavbar />
      {children}
    </>
  )
}
```

### `src/app/(dashboard)/layout.tsx`

```tsx
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-pure-white p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### `src/app/(public)/layout.tsx`

```tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zeat-beige">
      {children}
    </div>
  )
}
```

---

## 6. Composants réutilisables

### `src/components/marketing-navbar.tsx`

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function MarketingNavbar() {
  return (
    <nav className="fixed top-0 z-50 flex h-20 w-full items-center justify-between bg-white/80 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-12">
        <span className="text-2xl font-bold tracking-tighter text-uber-black">
          Zeat
        </span>
        <div className="hidden gap-8 md:flex">
          <Link href="#" className="text-muted-gray hover:text-uber-black">
            Configuration simple
          </Link>
          <Link href="#" className="text-muted-gray hover:text-uber-black">
            Commandes directes
          </Link>
          <Link href="#" className="text-muted-gray hover:text-uber-black">
            Sans commission
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="rounded-full border-uber-black font-bold"
        >
          Profile
        </Button>
      </div>
    </nav>
  )
}
```

### `src/components/dashboard-sidebar.tsx`

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Menu,
  BarChart3,
  Settings,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: Menu },
  { href: "/dashboard/orders", label: "Orders", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r border-transparent bg-[#faf9f9] py-8 md:flex">
      <div className="px-6">
        <h1 className="text-xl font-black tracking-tighter text-uber-black">
          Zeat Kitchen
        </h1>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Management Suite
        </p>
      </div>
      <nav className="mt-10 flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-uber-black text-pure-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-uber-black"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto px-6">
        <div className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-uber-black text-xs font-bold text-white">
            ZA
          </div>
          <div>
            <p className="text-xs font-bold">Zeat Admin</p>
            <p className="text-[10px] text-gray-500">Kitchen Lead</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
```

### `src/components/dashboard-header.tsx`

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-white/80 px-8 backdrop-blur-xl">
      <nav className="hidden gap-6 md:flex">
        <Link href="/dashboard" className="border-b-2 border-uber-black pb-1 font-bold">
          Dashboard
        </Link>
        <Link href="/dashboard/menu" className="font-medium text-muted-gray hover:text-uber-black">
          Menu
        </Link>
        <Link href="/dashboard/orders" className="font-medium text-muted-gray hover:text-uber-black">
          Orders
        </Link>
        <Link href="/dashboard/settings" className="font-medium text-muted-gray hover:text-uber-black">
          Settings
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        <Button variant="link" className="font-medium text-uber-black" asChild>
          <Link href="/menu/demo">Public Menu</Link>
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  )
}
```

---

## 7. Pages

### Landing Page : `src/app/(marketing)/page.tsx`

```tsx
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
    <>
      <main className="pt-20">
        {/* Hero Section */}
        <section className="flex min-h-[calc(100vh-5rem)] flex-col md:flex-row">
          <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-20 md:py-0">
            <div className="max-w-xl">
              <h1 className="text-display mb-6 text-uber-black">
                Le Menu. Distillé.
              </h1>
              <p className="mb-10 text-lg font-medium leading-relaxed text-body-gray md:text-xl">
                Pas de fouillis QR. Pas d'applications à télécharger. Juste un beau menu
                aux tons beiges qui envoie les commandes directement à votre cuisine.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  className="pill-button bg-uber-black px-10 py-6 text-lg text-pure-white hover:bg-uber-black/90"
                >
                  <Link href="/signup">Créer mon menu</Link>
                </Button>
                <Button
                  variant="outline"
                  className="pill-button border-uber-black px-10 py-6 text-lg text-uber-black hover:bg-muted"
                >
                  Voir la démo
                </Button>
              </div>
            </div>
          </div>
          <div className="relative h-[512px] w-full overflow-hidden bg-muted md:h-auto md:w-1/2">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuATgQlYOubVJ4y3mDrscTvwUKrypS9hcCu8KQuukZWiD7kVNa_kjsxbdSlKV4dqEGPb2XVEWi6JRw9j7OhgjSyNpJgEyIOzhNj7ptBk5mV26XV2AEiM8kfnyhAkG5qrJxWRlUlwvCxXRVofW1NYI7vtt1lNJYXcdrVKUNxfc_LOCuQEWCgRTx7RjGt_iy4NPgwrtjD4uDOnDxOTkJX20XZAvzE16-O2CObAjIKI8saHeMs-3_zXEMBQ-XUmmXliBW6fEqOHqp0z8hNs"
              alt="Plat gastronomique"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-8 left-8 right-8 rounded-lg border border-white/20 bg-white/40 p-6 backdrop-blur-md md:left-12 md:right-auto md:w-80">
              <div className="mb-2 flex items-center gap-3">
                <span className="material-symbols-outlined text-uber-black">
                  auto_awesome
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-uber-black">
                  Expérience Guest
                </span>
              </div>
              <p className="text-sm font-medium text-black">
                Interface optimisée pour la rapidité et l'élégance.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="bg-muted px-8 py-24 md:px-20">
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Pourquoi Zeat?</h2>
            <div className="mt-4 h-1 w-20 bg-uber-black" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group rounded-lg bg-pure-white p-10 transition-colors duration-500 hover:bg-uber-black"
              >
                <div className="mb-8 text-4xl text-uber-black group-hover:text-pure-white">
                  {feature.icon}
                </div>
                <h3 className="mb-4 text-xl font-bold group-hover:text-pure-white">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-body-gray group-hover:text-pure-white/80">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-8 py-24">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl bg-uber-black p-12 text-center md:p-20">
            <div className="relative z-10">
              <h2 className="mb-8 text-3xl font-bold text-pure-white md:text-5xl">
                Prêt à distiller votre menu ?
              </h2>
              <p className="mx-auto mb-12 max-w-xl text-lg text-pure-white/80">
                Rejoignez les restaurants qui privilégient l'expérience client sans
                compromis technologique.
              </p>
              <Button
                asChild
                className="rounded-full bg-pure-white px-12 py-6 text-xl font-bold text-uber-black hover:bg-pure-white/90"
              >
                <Link href="/signup">Démarrer l'essai gratuit</Link>
              </Button>
            </div>
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div className="absolute -left-1/2 -top-1/2 h-64 w-64 rounded-full bg-pure-white blur-[100px]" />
              <div className="absolute -bottom-1/3 -right-1/3 h-96 w-96 rounded-full bg-pure-white blur-[120px]" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-8 py-12 md:px-20">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="text-xl font-bold tracking-tighter text-uber-black">
              Zeat
            </span>
            <span className="text-sm font-medium tracking-tight text-muted-gray">
              Management Suite v1.4
            </span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-muted-gray">
            <Link href="#" className="hover:text-uber-black">
              Mentions légales
            </Link>
            <Link href="#" className="hover:text-uber-black">
              Confidentialité
            </Link>
            <Link href="#" className="hover:text-uber-black">
              Contact support
            </Link>
          </div>
          <p className="text-sm text-muted-gray">
            © 2024 Zeat. Distillé à Paris.
          </p>
        </div>
      </footer>
    </>
  )
}

const features = [
  {
    icon: "⚡",
    title: "Configuration simple",
    description:
      "Importez vos plats, fixez vos prix et générez votre lien en moins de 5 minutes.",
  },
  {
    icon: "🍽️",
    title: "Commandes directes",
    description:
      "Le client commande, vous recevez le bon immédiatement. Un flux fluide de la table à la cuisine.",
  },
  {
    icon: "💰",
    title: "Sans commission",
    description:
      "Gardez 100% de vos revenus. Pas de frais par commande, juste un abonnement transparent.",
  },
]
```

---

### Page Inscription : `src/app/(auth)/signup/page.tsx`

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[440px]">
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tighter text-uber-black">
            Zeat
          </h1>
          <p className="text-sm font-medium text-body-gray">
            Propulsez votre établissement vers l'excellence.
          </p>
        </div>

        <div className="space-y-8">
          <header className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-uber-black">
              Créer un compte
            </h2>
            <p className="mt-2 text-sm text-body-gray">
              Rejoignez l'élite de la restauration digitale.
            </p>
          </header>

          <form className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="restaurant-name"
                className="text-xs font-bold uppercase tracking-widest text-uber-black"
              >
                Nom du Restaurant
              </Label>
              <Input
                id="restaurant-name"
                placeholder="L'Atelier des Sens"
                className="input-uber"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-widest text-uber-black"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="chef@zeat.com"
                className="input-uber"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-widest text-uber-black"
              >
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input-uber"
              />
            </div>

            <div className="flex items-start gap-3">
              <Checkbox id="terms" className="mt-1 border-uber-black" />
              <label htmlFor="terms" className="text-xs text-body-gray">
                En continuant, vous acceptez nos{" "}
                <Link href="#" className="font-bold text-uber-black underline">
                  Conditions Générales
                </Link>{" "}
                et notre{" "}
                <Link href="#" className="font-bold text-uber-black underline">
                  Politique de Confidentialité
                </Link>
                .
              </label>
            </div>

            <Button className="w-full rounded-full bg-uber-black py-6 text-sm font-bold uppercase tracking-wide text-pure-white hover:bg-uber-black/90">
              Commencer
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-pure-white px-4 text-body-gray">
                Ou s'inscrire avec
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-full border-uber-black py-6 text-sm font-bold"
          >
            Google
          </Button>

          <footer className="text-center">
            <p className="text-sm text-body-gray">
              Déjà un compte ?{" "}
              <Link
                href="/auth/login"
                className="font-extrabold text-uber-black underline-offset-4 hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}
```

---

### Dashboard vide : `src/app/(dashboard)/dashboard/page.tsx`

```tsx
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { PlusCircle } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      {/* Ambiance subtile */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted blur-[120px]" />
      </div>

      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        {/* Illustration */}
        <div className="relative mb-12 flex h-72 w-72 items-center justify-center">
          <div className="absolute inset-0 scale-110 rounded-full bg-muted/50" />
          <div className="relative z-10 flex h-64 w-64 items-center justify-center overflow-hidden rounded-full border-[12px] border-muted bg-pure-white shadow-2xl">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoJIF3PmlRO-BIR7QxKS3auhFLwxBAE9E-yUrsjSvmZpB5huVkvth-b5YbHNup3HPKxoOk_S-gD_tsO7KVmUJ0TPHUrcStZVZ-bxVQdNIinR3jqkVF6bGNyGMGNLU4fWscgE63HTTEYuU29sp15qZaM9eG06a1Mt6XcJ6wLn_a86Aw1L7cAfFSil3A8o4oW99gawY3BAxT3OUb63tMMlApdVWbpIfbmwef-4S79J2piNsXyXDmeriLLnVH6HMeMPtmH18D4GFEYgo2"
              alt="Assiette vide"
              fill
              className="object-cover opacity-90"
            />
          </div>
          <div className="absolute -right-4 top-10 flex h-24 w-24 rotate-12 items-center justify-center rounded-full bg-zeat-beige shadow-lg">
            <span className="material-symbols-outlined text-4xl text-tertiary">
              restaurant
            </span>
          </div>
        </div>

        <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-uber-black md:text-6xl">
          Votre menu est une{" "}
          <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
            toile vierge.
          </span>
        </h1>
        <p className="mb-10 max-w-lg text-lg leading-relaxed text-body-gray md:text-xl">
          Commencez par organiser votre carte. Ajoutez vos catégories pour offrir une
          expérience gastronomique fluide à vos clients.
        </p>

        <Button className="group flex items-center gap-3 rounded-full bg-uber-black px-10 py-6 text-lg font-bold text-pure-white shadow-xl shadow-black/10 hover:bg-uber-black/90">
          Ajouter votre première catégorie
          <PlusCircle className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>

        <div className="mt-16 flex items-center gap-8 rounded-2xl border border-border/10 bg-muted/30 px-12 py-6 backdrop-blur-sm">
          <div className="flex -space-x-3">
            <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-pure-white bg-muted">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzQfvJuWeUUYVvTei0ZEX5WsMX2J4aUQrL8n3LQJsc5TK4Ltj_pUTHr7m-aUyL4frOLemHzEYgzxwIU9mVcJ8QHWsUGHMJ1jFtLLoVmtEop3kQFX6y2eWkthiQFGkcKtdfZhF5D90YeVQ5dw0V49eVs6IXMq15UxcPXcHlSMGPNytv2mgKd6lON9xi5b9ps4NfB8e5VG3JA7dsNq1mh5SzfnOv-GCmcLZePQ6d7Ub_FyR6ZuiJqNeLpnGgCuNXmhAoeOAfk0DXpBws"
                alt="Restaurateur"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-pure-white bg-muted">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHUQNLxaAnoopfpURnj3PFS29XIxCeOlMInceYBWfl170q0YjM5FibR8c9sCSafjI2ufYZwq2ghXNIwJpuL_v45LOxb8puUYG01a7Prqfq1PW0I9g9X0zErCgQU-Zn7iQ05qSur3RzCyCzLzom6A_b2_4cJHkBxxi_HIHc8Q3prqf3ccnuvPE9fN3JLOvw63l6yYlAijG6QU3JX5DnKW6QWJiIFj88YD9NrqlKQftg1DStgu35lK7VALATnQGZLTCItOVCLRjbu6R6"
                alt="Chef"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          </div>
          <p className="text-sm font-medium text-body-gray">
            Rejoignez <span className="font-bold text-uber-black">2,400+</span>{" "}
            restaurateurs qui utilisent Zeat.
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

### Gestion du Menu (Catégories + Plats) : `src/app/(dashboard)/dashboard/menu/page.tsx`

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react"

export default function MenuManagementPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-body-gray">
            Catalogue Gastronomique
          </span>
          <h1 className="text-[3.5rem] font-extrabold leading-[0.9] tracking-tighter text-uber-black">
            Categories.
          </h1>
        </div>
        <Button className="rounded-full bg-uber-black px-8 py-6 font-bold text-pure-white hover:bg-uber-black/90">
          <Plus className="mr-2 h-5 w-5" />
          Create New Category
        </Button>
      </header>

      {/* Grille des catégories */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Formulaire d'ajout rapide */}
        <Card className="flex min-h-[280px] flex-col justify-between rounded-lg border-none bg-muted p-8 shadow-whisper">
          <CardContent className="p-0">
            <h3 className="mb-4 text-xl font-bold tracking-tight">New Category</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-body-gray">
                  Label Name
                </Label>
                <Input
                  placeholder="e.g. Seasonal Specials"
                  className="input-uber mt-1"
                />
              </div>
            </div>
          </CardContent>
          <Button className="mt-6 w-full rounded-full bg-uber-black py-6 text-sm font-bold text-pure-white">
            Confirm Category
          </Button>
        </Card>

        {/* Catégories existantes */}
        {categories.map((category) => (
          <CategoryCard key={category.name} {...category} />
        ))}
      </div>

      {/* Gestion des plats (section séparée) */}
      <div className="mt-16">
        <header className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dish Management.</h2>
          <span className="rounded-full bg-uber-black px-3 py-1 text-[10px] font-bold text-pure-white">
            12 PLATS
          </span>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Formulaire plat */}
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Nouveau Plat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-body-gray">
                  Nom du plat
                </Label>
                <Input placeholder="ex: Filet de Bar Rôti" className="input-uber" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-body-gray">
                  Description
                </Label>
                <Textarea
                  placeholder="Décrivez les saveurs..."
                  rows={4}
                  className="input-uber"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-body-gray">
                  Prix (€)
                </Label>
                <div className="relative">
                  <Input type="number" step="0.01" className="input-uber pr-8" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-body-gray">
                    €
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button className="rounded-full bg-uber-black py-6 font-bold">
                  Enregistrer
                </Button>
                <Button variant="outline" className="rounded-full border-uber-black py-6">
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des plats */}
          <Card className="lg:col-span-7">
            <CardContent className="space-y-4 p-6">
              {dishes.map((dish) => (
                <DishRow key={dish.name} {...dish} />
              ))}
              <div className="flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-border/30 p-6 transition-all hover:border-uber-black/20 hover:bg-pure-white">
                <Plus className="mb-2 h-6 w-6 text-muted-gray" />
                <p className="text-xs font-bold uppercase tracking-tighter text-muted-gray">
                  Ajouter un nouveau plat
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CategoryCard({ name, count, images }: any) {
  return (
    <Card className="group flex min-h-[280px] flex-col justify-between rounded-lg border-none p-8 shadow-whisper transition-shadow hover:shadow-medium">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[20px] font-bold leading-tight">{name}</h3>
            <p className="text-xs font-medium text-body-gray">{count} Items Listed</p>
          </div>
          <MoreVertical className="h-5 w-5 cursor-pointer text-body-gray opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="my-6 flex -space-x-3">
          {images?.map((img: string, i: number) => (
            <div
              key={i}
              className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-pure-white"
            >
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-pure-white bg-muted text-[10px] font-bold">
            +{count - 3}
          </div>
        </div>
      </div>
      <Button className="w-full rounded-full bg-uber-black py-6 text-sm font-bold">
        <Plus className="mr-2 h-4 w-4" />
        Ajouter un plat
      </Button>
    </Card>
  )
}

function DishRow({ name, price, description, image }: any) {
  return (
    <div className="group flex items-center gap-6 rounded-sm border border-border/5 p-4 transition-colors hover:bg-pure-white">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
      <div className="flex-grow">
        <div className="flex items-start justify-between">
          <h4 className="text-lg font-bold tracking-tight">{name}</h4>
          <span className="text-xl font-black">{price}€</span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-body-gray">{description}</p>
      </div>
      <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 rounded-full border-destructive text-destructive hover:bg-destructive hover:text-white"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

const categories = [
  {
    name: "Entrées",
    count: 12,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJ2-ZOpgVCna1l7-InIa4pXe7Owa7WfEQ_4vhCIIdaPtc1bxHFszYNsQ7iRrbehiZEKQJLVUWVy1ft-LpLtWMYdtijNKeDWZyczuHhQRoFjQHt4CfWmKw6oSZFp6TUs8YegHYNkuXNHOYVm1MKGE98Fp8N1_6CJrPoKlOP3C5_FctaY33GhnC6XwSEcpFls1M7fUsrvEWUrR5ZOEoGtxa6ZRTkGZhLVJaJtjGTMSFhOk32VBexdIoxatThl6uj_TcJ-AhPe8nOhU37",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB3YOa9-Xo9ecsSbcumFLf2W-Cqj6_6uAAmQWcGmvOpWeeONd93SbDw0g_wDDkgWAC_deEHHAGcV-JaNYikbGBGQmhhIjRIpWW4z90VpDvSbomQQlvafnnboqeb6FNq_HaG4CGvOr-PbK92rwIUG3EjO9H0ZbAIDIXeyAaZMiu5ylTd8gsuw0pazmEGq0Qqrb_5henCIflEEWkV_DhL6sDpoubRwyh7o3B9CldL-2Y9Y09jZbszCATb3YNvfs_MAu5KWLzK8VSNcG6z",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcnQV5cYcLIXNVx8mpqzqDogIo1fzsuczKHqCGPf6OGkbYIX6-tawWavr9wyNrBtA_qffDWd-5Rg3dpu-UllHwQvomHZt6k2W-nG07DP7_I--HGXHpBIGD6obUmVEjjBtuaPoQEGjAu3zAvj-R7WCGGT1L8qassCA1dw19aLXIo6o4NE3uOOk9TbPKKOYc-4aF9-m9nUgM3er8H2fduX02C8eMk59uN2_rxm6KNnjDmx5YWb0yN8KZRrd8d_fv-XoxnUNyv61VqNpr",
    ],
  },
  {
    name: "Plats Principaux",
    count: 8,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDo9n0ugKqFbNr0OsQ_qJ6XqdSfCi0pt5b1KPWBfZK7BkyJgSoOhJlEa7BhibRYT0Ep8KmwuJhyZifIYsassS2JMwBq0SYctNP3iwOK_bngVZPL_v3fzgn47vOobWctrTWvOaOd2MQv97T3Bd0RtdjqEI32K7A5LneYGnoQF8fGVlk-r5dV-6DPb4f2YP36Ewt5_qQ5kB3tNcHDuCY49isEeVRSe21ciWOjHsXXBa0GC15wJCHAo5c5-50OPDERls_h_HxlHqxvcJ-g",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBntMuGXZ3Fcr-4vdCnQtpredCTP49WmziK5eC9_jeIyMVLQAGmAkuiPQfSpIDLhY_khPSyBtWs2LdzUWKNPljRL7GHKe8MSdMsbo40aAvnZYFtRlYiZ1j1VKWlvWK5ugVxYaohaFbh4MmoBwzHC2JufqFoAF49KkV8D9ldkSfeT74ljubKEFp2f_jW6xBEJHsBjYWXjlMuAGJEy5CRBmJmtnYlBLAvUILudz72MU9uv5l-BZzXjaSlwMVuPKGBg0FMiTcD6Sfx99my",
    ],
  },
]

const dishes = [
  {
    name: "Salade de Saison",
    price: 24,
    description: "Jeunes pousses, vinaigrette au miel de lavande et noisettes torréfiées.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBq3X7P9vTMOaXKNjLEy9mglLeG479t0ky8yP-bR0ynjRlej4Vae82UBAe7PB0FZzgVXewbhNSJqoQSqzDWU4I7i-T-dAOzMeNM7yhTgLvKJ3dp1t9bpk0Tb4zDBC671gnJxYywcDa9LTmH47MKzD4Jj3Qv7Ev7uIMp9m-aMpVNFeNEmXGEDahvETg_eopyO_JA32L52Ux4DvCU0mDPbsK5GHmNVDCC7_NAcwt3b56tUjpw4dCfnPbWzPg_e6nSuMvMNfkFjLAivYyz",
  },
  {
    name: "Wagyu A5 Rôti",
    price: 85,
    description: "Boeuf d'exception, jus corsé à la truffe noire et mousseline de céleri.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAARlczevyAHwfCCvqw2-wljI2rwoZ85iZAG2Yy3hPA5vbShdiXFWQ6LbJjv7u_2NTr267D2gCRdbyzR6Qa-rmrpPGb6ApfJIprVDI3RmcL95zkx_IaqTGzwXWUogLgFaAeapkwVpJVaX94VAnFxRG35RInGibsB8fbJ1FudDEf6N9MGSJOq_kcjOU9unPxBTWA8WViNvwRHaf7XdFd78JN89gxL5f4ceVIN-2JeFlxJZM-cFc8It7c9SExHQ2S_edL-dnEBz_Ob4pL",
  },
]
```

---

### Gestion des Commandes : `src/app/(dashboard)/dashboard/orders/page.tsx`

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"
import Image from "next/image"

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-uber-black">
            Active Orders
          </h1>
          <p className="mt-2 font-medium text-body-gray">
            Managing live kitchen production and logistics.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full border-uber-black">
            Export Logs
          </Button>
          <Button className="rounded-full bg-uber-black text-pure-white">
            New Manual Order
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="New" value="12" />
        <StatCard label="Preparing" value="08" />
        <StatCard label="Ready" value="04" />
        <StatCard label="Avg. Time" value="14m" />
      </div>

      {/* Grille des commandes */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <OrderCard
          orderNumber="#23"
          customer="John D."
          table="Table 4"
          takeaway
          time="Il y a 2 min"
          items={["2x Steak Frites", "1x Salade"]}
          status="new"
        />
        <OrderCard
          orderNumber="#24"
          customer="Sarah M."
          table="Table 12"
          time="Il y a 5 min"
          items={["1x Burger Deluxe", "1x Frites Maison", "1x Coca-Cola"]}
          status="new"
        />
        <OrderCard
          orderNumber="#21"
          customer="Mike R."
          takeaway
          time="8 min elapsed"
          items={["3x Tacos Carnitas", "1x Guacamole Large"]}
          status="preparing"
        />
        <OrderCard
          orderNumber="#25"
          customer="Alex K."
          table="Table 2"
          takeaway
          time="Just now"
          items={["1x Pasta Carbonara", "1x Garlic Bread"]}
          status="new"
        />

        {/* Carte de capacité */}
        <Card className="col-span-1 overflow-hidden xl:col-span-2">
          <CardContent className="flex flex-row items-center gap-6 p-6">
            <div className="flex-1">
              <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter">
                Kitchen Capacity
              </h3>
              <p className="mb-6 text-sm text-body-gray">
                Current station load is 65%. 3 orders pending assignment.
              </p>
              <div className="mb-2 h-2 w-full rounded-full bg-muted">
                <div className="h-full w-[65%] rounded-full bg-uber-black" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-gray">
                System optimized for 12min turnaround
              </p>
            </div>
            <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-2xl">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzM8T4a9KxLsLzmJzILxG-iJWQGc9GMF3_EnpmjI3SVSi9FcWZs46Y8IYAbQaoE8MWP3wZMggYW_7sey49TsKMhEK4Y8CPDOnzDjRz-zhR5Wycg2HLcI6IztSqq-lP3BHiyMN3D_upfYseKD6qaEBTyfnA8ptJjWzSGbivoWuDlohCY_FPYWBSOkqiVyyHQPWkJ6KiwgrNvBkMzgP9VkXzu6W1vVpof-EGIj3HqZ2nVEKLN13qYhuni4-kkIZbBpHad14Y9XSeaXk5"
                alt="Kitchen"
                fill
                className="object-cover grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-gray">
          {label}
        </p>
        <p className="text-3xl font-black">{value}</p>
      </CardContent>
    </Card>
  )
}

function OrderCard({ orderNumber, customer, table, takeaway, time, items, status }: any) {
  const isNew = status === "new"
  return (
    <Card
      className={`flex min-h-[220px] flex-col justify-between border-l-4 ${
        isNew ? "border-uber-black" : "border-transparent"
      } ${!isNew ? "bg-muted opacity-80" : ""} p-6 transition-all hover:-translate-y-1`}
    >
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">
              {orderNumber} - {customer}
            </h3>
            <div className="mt-2 flex gap-2">
              {table && (
                <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase text-on-secondary-container">
                  {table}
                </span>
              )}
              {takeaway && (
                <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase text-body-gray">
                  À emporter
                </span>
              )}
              {!isNew && (
                <span className="rounded-full bg-uber-black px-3 py-1 text-[10px] font-bold uppercase text-pure-white">
                  Preparing
                </span>
              )}
            </div>
          </div>
          <span className="text-xs font-bold text-muted-gray">{time}</span>
        </div>
        <div className="space-y-1 border-t border-transparent pt-4">
          {items.map((item: string, idx: number) => (
            <p key={idx} className="text-sm font-bold text-uber-black">
              {item}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        {isNew ? (
          <>
            <Button className="flex-1 rounded-full bg-uber-black py-6 text-xs font-black uppercase tracking-widest">
              Start Prep
            </Button>
            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            className="w-full rounded-full border-uber-black py-6 text-xs font-black uppercase"
          >
            Mark Ready
          </Button>
        )}
      </div>
    </Card>
  )
}
```

---

### Menu Public (Beige) : `src/app/(public)/menu/[slug]/page.tsx`

```tsx
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { MapPin, Phone, Star, ShoppingBag } from "lucide-react"

export default function PublicMenuPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <header className="fixed top-0 z-50 flex h-24 w-full items-center justify-between bg-white/80 px-8 backdrop-blur-xl">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tighter text-uber-black">
            Zeat
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-gray">
            Public Menu
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-uber-black text-sm font-bold text-pure-white">
            JD
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-32 md:px-12">
        {/* Restaurant Header */}
        <section className="mb-16">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="mb-6 text-5xl font-extrabold tracking-tighter text-uber-black md:text-7xl">
                L'Assiette Dorée
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-2 rounded-full bg-secondary-container/30 px-4 py-2 text-sm font-bold text-tertiary">
                  <MapPin className="h-4 w-4" />
                  12 Rue de la Paix, Paris
                </span>
                <span className="flex items-center gap-2 rounded-full bg-secondary-container/30 px-4 py-2 text-sm font-bold text-tertiary">
                  <Phone className="h-4 w-4" />
                  +33 1 42 61 58 20
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-gray">
                Gastronomie Française
              </p>
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-uber-black text-uber-black" />
                ))}
                <Star className="h-5 w-5 text-uber-black" />
              </div>
            </div>
          </div>
        </section>

        {/* Hero Image */}
        <section className="mb-20">
          <div className="relative h-[400px] w-full overflow-hidden rounded-xl shadow-whisper">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmOopDuJaqG7-ErUuIUrGr5BzG2GJipKSQg8QC_OS2bc1XuPw51qShwH7DLQu5_4G60E9SNHNmOPgG3xlnuC7g8SKj-KjpRlD2xbBjZrp2G9uCLi2co5zPg_YIbFqKHxU_o3X6tu_-dxyAgXL8xks_X6wr_1BNFBYY8Rh_GWVZOV_cf3Y74xhNBAfScJ8hCycKFOv2Zf4lm8V6WTK2oxVNiZQ8Io8kXWdcawh4-t1l-T7gCssXKkZNxcki8_UouchG7Nutp0qkEt_C"
              alt="Restaurant"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </section>

        {/* Catégories */}
        <section className="sticky top-24 z-40 -mx-6 mb-12 bg-zeat-beige/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex gap-8 border-b border-border/20">
            <button className="border-b-2 border-uber-black pb-4 text-xl font-bold text-uber-black">
              Entrées
            </button>
            <button className="pb-4 text-xl font-medium text-muted-gray hover:text-uber-black">
              Plats
            </button>
            <button className="pb-4 text-xl font-medium text-muted-gray hover:text-uber-black">
              Desserts
            </button>
            <button className="pb-4 text-xl font-medium text-muted-gray hover:text-uber-black">
              Vins
            </button>
          </div>
        </section>

        {/* Grille des plats */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <MenuItemCard key={item.name} {...item} />
          ))}
        </div>
      </main>

      {/* Floating Cart Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button className="flex items-center gap-3 rounded-full bg-uber-black px-8 py-6 text-pure-white shadow-float hover:scale-105">
          <ShoppingBag className="h-5 w-5" />
          <span className="font-bold tracking-tight">Voir la commande</span>
          <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">2</span>
        </Button>
      </div>
    </>
  )
}

function MenuItemCard({ name, price, description, image, tag }: any) {
  return (
    <div className="group flex flex-col justify-between rounded-xl bg-pure-white p-8 shadow-whisper transition-transform hover:-translate-y-1">
      <div>
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-lg">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-xl font-bold text-uber-black">{name}</h3>
          {tag && (
            <span className="rounded bg-tertiary-container/10 px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-tertiary-container">
              {tag}
            </span>
          )}
        </div>
        <p className="mb-6 text-sm leading-relaxed text-body-gray">{description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-xl font-bold text-uber-black">{price} €</span>
        <Button
          variant="outline"
          className="rounded-full border-uber-black font-bold text-uber-black hover:bg-uber-black hover:text-pure-white"
        >
          Ajouter
        </Button>
      </div>
    </div>
  )
}

const menuItems = [
  {
    name: "Foie Gras de Canard",
    price: 28,
    description: "Poêlé, chutney de figues fraîches et pain brioché toasté.",
    tag: "Signature",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB8ZuMcVYxGYlENZ-GOO1mYoiFAsSVZwVS69N2I2eJMe95CdCaOySFI5TJfsLVZ8MMjvVoIQ5NXxTqBLqgpcDK0r7Vs6uPCuO9BMs776Ti3kL-cU41btUhqW6M7swbSzoR5Rt6g-I5nh4QG1J53zNyR57n8IoAui26jWfY6qhfVMlOmLUmQ7Odsiffhs09nr1fN-kL49pWKD0qjVP9eM4F1p6h0FnT2LRW-tX8P7n1bJcWJcb4Fv2H_PiY2TqZ74DFhuqmfIf4oGCMF",
  },
  {
    name: "Carpaccio de Saint-Jacques",
    price: 24,
    description: "Zestes de citron vert, huile d'olive vierge et fleurs comestibles.",
    tag: undefined,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAPXNXwj_6Zmu_W9MAcYIFdBXGnsTwjCTqMsjl9P3HQYDUn6HfNND5TKg_dHcM2uK--ULZ6BW_5NzW8bv8vnwceScKdcWpSPzHRQTUrF-0e7tezPhBw0jMO8saaT8W05f4nvO0aTry-ILCwIg7wZXr5h0prxTdeESeNWPyqrmasH2cY8IKgHJ9EALu3e3T5rUQ1dajuP3fo_lWe3SgtnqO3qcQ2GtUkVP8aLjTR8RuUOoNO3a5P5P3D42Bvv9lwWQUvkFBXRLmLdmZN",
  },
  {
    name: "Velouté de Châtaignes",
    price: 19,
    description: "Émulsion à la truffe noire et éclats de noisettes torréfiées.",
    tag: "Végétarien",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDW6OxE9k1V05PZoNBnqfNUpHS5GXMW_PWaG38_GE_x4uhv321AaQXkHmePiX87B-0pmR0-C5XT_JFK5g_RFb84h_qMnhGzOYi6_T7SxfX2s2d7YSjyEQskfEb1TkSdFsOONo23jKkSfNzGtimbcEjz0a6yFjz_VE5Rrw8wZJmqPRMaVZRzpXIKFR6y8uPD6jhfRyEIbdnDJd5jtJUNclsAvyo_9zAGPaMNj8_yheY99jBkhP27U0TPBoYuBOhsuu7CI0EwMnN1o9E6",
  },
]
```

---

### Panier / Checkout : `src/app/(public)/cart/page.tsx`

```tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import Image from "next/image"
import { X, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function CartPage() {
  const [open, setOpen] = useState(true)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
        <SheetHeader className="px-8 pt-10">
          <SheetTitle className="text-[20px] font-bold tracking-tight text-uber-black">
            Votre Commande
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-8">
          {/* Articles */}
          <div className="mb-12 space-y-8">
            {cartItems.map((item) => (
              <CartItemRow key={item.name} {...item} />
            ))}
          </div>

          {/* Total */}
          <div className="space-y-4 border-t border-border pt-8">
            <div className="flex justify-between text-sm text-body-gray">
              <span>Sous-total</span>
              <span>50€</span>
            </div>
            <div className="flex justify-between text-sm text-body-gray">
              <span>Frais de service</span>
              <span>4€</span>
            </div>
            <div className="flex items-baseline justify-between pt-4">
              <span className="text-xl font-bold text-uber-black">Total</span>
              <span className="text-3xl font-extrabold tracking-tighter text-uber-black">
                54€
              </span>
            </div>
          </div>

          {/* Formulaire */}
          <form className="mt-12 space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="px-1 text-[10px] font-bold uppercase tracking-widest text-body-gray"
              >
                Nom
              </Label>
              <Input
                id="name"
                placeholder="Jean Dupont"
                className="input-uber"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="px-1 text-[10px] font-bold uppercase tracking-widest text-body-gray"
              >
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+33 6 00 00 00 00"
                className="input-uber"
              />
            </div>
          </form>
        </div>

        {/* CTA Sticky */}
        <div className="mt-auto p-8">
          <Button className="flex w-full items-center justify-center gap-3 rounded-full bg-uber-black py-6 text-md font-bold text-pure-white shadow-lg active:scale-[0.98]">
            Passer la commande
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-4 px-6 text-center text-[10px] leading-relaxed text-body-gray">
            En passant commande, vous acceptez nos conditions générales.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function CartItemRow({ name, price, description, image }: any) {
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-20 w-20 flex-shrink-0">
        <Image src={image} alt={name} fill className="rounded-sm object-cover" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <span className="text-md font-bold text-uber-black">{name}</span>
          <span className="text-md font-bold text-uber-black">{price}€</span>
        </div>
        <p className="mt-1 text-xs text-body-gray">{description}</p>
        <button className="mt-2 text-xs font-bold text-uber-black underline">
          Supprimer
        </button>
      </div>
    </div>
  )
}

const cartItems = [
  {
    name: "Salade d'Hiver",
    price: 18,
    description: "Saisonale & Bio",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC6poP-O2hhDiv-NAbHFPic_r8jI8UADZx9_k5971R-Ou75CGuK7ImAxJwDf2cRUwVx8vBPtRA3caTvckfu_8EQTuRtyAra85kwIbqw9EIWOGG7i7o1qh2WCieWaJBeRprNUN2trmj_EEMxL6kn0yqzl1-T8wfTlAFO53saL-GJ2jOcHKqwpP348cUey02I2XaKK4tIjSYKeUwXyh4ELaVphzzVIiDadGI4jOv67KeQcVSknpRAPHuu9J3xshUkP7ZvJaVpWzFoObPE",
  },
  {
    name: "Linguine au Homard",
    price: 32,
    description: "Homard bleu de Bretagne",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAKPTcE-LaZV3tSicbNh0kF3M_5CNk1hfqsdHRF5ZFfUeeUduF3kP6mzJ3f37m_oXlUXBwlQtvbN49Og8JSyXnM9D9oUR9A6Xh4cHDGhqHW4MCR2AjpBemIO9mMT-fvJBQG2Qikaf9sdvv4GcdeN3etyIQ-jv4XXKqYpD_Ci3giVHp1drnEszihZNvjzSbKqgO4GDJ2i_B_wRw1TA6_Gvm5bOeQzYj67AW-2edQ88t3yTcUJiFQ0cuTHwChFf587VfWYGSu2OLP6-pH",
  },
]
```

---

### Confirmation : `src/app/(public)/confirmation/page.tsx`

```tsx
import { Button } from "@/components/ui/button"
import { CookingPot } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="w-full max-w-md space-y-10">
        {/* Icône */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 scale-75 rounded-full bg-uber-black/5 blur-3xl" />
            <div className="relative rounded-full bg-pure-white p-12 shadow-whisper">
              <CookingPot className="h-20 w-20 text-uber-black" />
            </div>
          </div>
        </div>

        {/* Texte */}
        <div className="space-y-4">
          <h1 className="text-[36px] font-bold leading-tight tracking-tight text-uber-black">
            Merci, John.
          </h1>
          <p className="mx-auto max-w-xs text-lg leading-relaxed text-body-gray">
            Votre commande a été envoyée en cuisine. Nous vous appellerons quand elle
            sera prête.
          </p>
        </div>

        {/* Bouton retour */}
        <div className="pt-6">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-uber-black px-10 py-6 font-bold text-uber-black hover:bg-uber-black hover:text-pure-white"
          >
            <Link href="/menu/demo">Retourner au menu</Link>
          </Button>
        </div>

        {/* Statut */}
        <div className="mt-12 flex items-center gap-4 rounded-lg border border-border/10 bg-muted/50 p-6 text-left">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-uber-black">
            <CookingPot className="h-6 w-6 text-pure-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-body-gray">
              État actuel
            </p>
            <p className="text-lg font-bold text-uber-black">Préparation en cours</p>
          </div>
          <div className="ml-auto flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-uber-black" />
            <span className="h-1.5 w-1.5 rounded-full bg-uber-black/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-uber-black/20" />
          </div>
        </div>
      </div>

      <footer className="py-12 opacity-30">
        <span className="text-xl font-black tracking-tighter text-uber-black">
          Zeat
        </span>
      </footer>
    </main>
  )
}
```

---

## 8. Fichier `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Installation et exécution

1. Créez un projet Next.js : `npx create-next-app@latest zeat --typescript --tailwind --app`
2. Installez les dépendances : `npm install lucide-react @radix-ui/react-slot class-variance-authority clsx tailwind-merge tailwindcss-animate`
3. Ajoutez Shadcn/ui : `npx shadcn@latest init` (choisissez les options par défaut, style "default", couleur "zinc")
4. Ajoutez les composants nécessaires : `npx shadcn@latest add button input card label separator sheet dialog table checkbox textarea`
5. Remplacez le contenu des fichiers par le code ci-dessus.
6. Lancez `npm run dev`.
