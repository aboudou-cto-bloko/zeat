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

export default function SignupPage() {
  const { signIn } = useAuthActions();
  const createRestaurant = useMutation(api.restaurants.create);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
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
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="8 caractères minimum"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-zeat"
                minLength={8}
                required
              />
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
