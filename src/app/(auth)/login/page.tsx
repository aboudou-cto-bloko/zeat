"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn("password", {
        email: form.email,
        password: form.password,
        flow: "signIn",
      });
      router.push("/dashboard");
    } catch {
      toast.error("Email ou mot de passe incorrect.");
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
          <h1 className="text-headline-sm mb-1 text-uber-black">Bon retour</h1>
          <p className="text-caption text-muted-gray mb-8">
            Connectez-vous à votre espace restaurant.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-zeat"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-uber-black text-white font-bold py-3 hover:bg-body-gray transition-colors"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-caption text-muted-gray">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-medium text-uber-black underline underline-offset-2">
              Créer mon menu
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
