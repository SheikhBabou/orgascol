"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            plan: plan === "annuel" ? "annuel" : "mensuel",
          },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage(
          "Compte créé ! Vérifie tes emails pour confirmer ton inscription."
        );
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — gradient */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden items-end p-12">
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative space-y-6 max-w-md animate-hero-text">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="w-10 h-10 text-white" />
            <span className="text-2xl font-bold text-white">Orga&apos;Scol</span>
          </Link>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Organise tes révisions,<br />
            <span style={{ color: "#c4b5fd" }}>sérénité assurée.</span>
          </h2>
          <p className="text-white/50 leading-relaxed">
            Rejoins les étudiants qui planifient intelligemment. 1 mois
            d&apos;essai gratuit, puis {plan === "annuel" ? "9,99€/mois (annuel)" : "11,99€/mois"}.
          </p>
          <div className="mt-4 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 animate-fade-in">
            <p className="text-sm font-semibold text-white">
              Plan {plan === "annuel" ? "Annuel" : "Mensuel"} sélectionné
            </p>
            <p className="text-xs text-white/50 mt-1">
              {plan === "annuel" ? "9,99€/mois · 99,90€/année scolaire · Engagement 10 mois · Paiement mensuel ou en une fois" : "11,99€/mois · Résiliable à tout moment"}
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="lg:hidden space-y-3 mb-4">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Orga&apos;Scol</span>
            </Link>
            <div className="px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-semibold text-primary">
                Plan {plan === "annuel" ? "Annuel" : "Mensuel"} — {plan === "annuel" ? "9,99€/mois" : "11,99€/mois"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {isLogin ? "Content de te revoir" : "Crée ton compte"}
            </h1>
            <p className="text-sm text-muted">
              {isLogin
                ? "Connecte-toi pour retrouver ton planning."
                : plan === "annuel"
                  ? "1 mois gratuit, puis 9,99€/mois. Aucune carte bancaire requise."
                  : "1 mois gratuit, puis 11,99€/mois. Aucune carte bancaire requise."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="ton@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="6 caractères minimum"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger/10 px-4 py-3 rounded-xl animate-fade-in">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-success bg-success/10 px-4 py-3 rounded-xl animate-fade-in">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors text-sm disabled:opacity-50 btn-magnetic"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Se connecter" : "Créer mon compte"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
