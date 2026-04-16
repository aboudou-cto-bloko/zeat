"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

// ── Password strength ──────────────────────────────────────────────────────────

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

function getStrength(password: string): StrengthLevel {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, score) as StrengthLevel;
}

const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  0: "",
  1: "Très faible",
  2: "Faible",
  3: "Moyen",
  4: "Fort",
};

const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  0: "bg-border",
  1: "bg-red-500",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-green-500",
};

const STRENGTH_TEXT: Record<StrengthLevel, string> = {
  0: "text-muted-gray",
  1: "text-red-500",
  2: "text-orange-400",
  3: "text-yellow-500",
  4: "text-green-600",
};

function PasswordStrength({ password }: { password: string }) {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1" aria-hidden="true">
        {([1, 2, 3, 4] as StrengthLevel[]).map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              strength >= level ? STRENGTH_COLORS[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={`text-micro font-medium ${STRENGTH_TEXT[strength]}`}>
          {STRENGTH_LABELS[strength]}
        </p>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const { signIn } = useAuthActions();
  const createRestaurant = useMutation(api.restaurants.create);
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    setLoading(true);

    try {
      await signIn("password", {
        email: form.email,
        password: form.password,
        flow: "signUp",
      });

      const slug = slugify(form.name) + "-" + Math.random().toString(36).slice(2, 6);
      await createRestaurant({ name: form.name, slug });

      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      toast.error(message.includes("exists") ? "Cet email est déjà utilisé." : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zeat-beige px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center">
          <span className="font-heading text-[32px] font-bold tracking-tighter text-uber-black">
            Zeat
          </span>
          <p className="mt-1 text-caption text-muted-gray">Le menu. Distillé.</p>
        </div>

        {/* Card */}
        <div className="card-whisper px-8 py-10">
          <h1 className="text-headline-sm mb-1 text-uber-black">Créer mon menu</h1>
          <p className="text-caption text-muted-gray mb-8">
            Votre restaurant en ligne en moins de 60 secondes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-caption font-medium text-uber-black">
                Nom du restaurant
              </Label>
              <Input
                id="name"
                name="organization"
                autoComplete="organization"
                placeholder="Ex : Chez Aminata…"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-zeat"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-caption font-medium text-uber-black">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-zeat"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-caption font-medium text-uber-black">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="8 caractères minimum"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-zeat pr-11"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-uber-black transition-colors"
                >
                  {showPassword
                    ? <EyeOff size={16} aria-hidden="true" />
                    : <Eye size={16} aria-hidden="true" />
                  }
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Warning notice */}
            <div className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-micro text-amber-700 leading-relaxed">
                <span className="font-semibold">Sauvegardez votre mot de passe.</span>{" "}
                Il n&apos;y a pas de récupération par email pour l&apos;instant — si vous le perdez, vous ne pourrez plus accéder à votre compte.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-uber-black text-white font-bold py-3 hover:bg-body-gray transition-colors"
            >
              {loading ? "Création en cours…" : "Créer mon compte"}
            </Button>
          </form>

          <p className="mt-6 text-center text-caption text-muted-gray">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-uber-black underline underline-offset-2">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
