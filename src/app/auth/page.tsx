"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { GraduationCap, ArrowRight, Loader2, Mail } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}

type View = "login" | "signup" | "forgot";

function AuthContent() {
  const [view, setView] = useState<View>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const supabase = createClient();

  function switchView(v: View) {
    setView(v);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (view === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Un email de réinitialisation a été envoyé. Vérifie ta boîte mail.");
      }
      setLoading(false);
      return;
    }

    if (view === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message === "Invalid login credentials") {
          const { data } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
          if (!data.user && !data.session) {
            setError("Aucun compte trouvé avec cet email. Inscris-toi pour commencer !");
          } else {
            setError("Mot de passe incorrect. Vérifie ton mot de passe ou réinitialise-le.");
          }
        } else {
          setError(error.message);
        }
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            plan: plan === "annuel" ? "annuel" : "mensuel",
          },
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          setError("Cet email est déjà utilisé. Connecte-toi ou réinitialise ton mot de passe.");
        } else {
          setError(error.message);
        }
      } else {
        setMessage(
          "Compte créé ! Vérifie tes emails pour confirmer ton inscription."
        );
      }
    }

    setLoading(false);
  }

  const titles = {
    login: "Content de te revoir",
    signup: "Crée ton compte",
    forgot: "Mot de passe oublié",
  };

  const subtitles = {
    login: "Connecte-toi pour retrouver ton planning.",
    signup: plan === "annuel"
      ? "1 mois gratuit, puis 9,99€/mois. Aucune carte bancaire requise."
      : "1 mois gratuit, puis 11,99€/mois. Aucune carte bancaire requise.",
    forgot: "Entre ton email et on t'envoie un lien de réinitialisation.",
  };

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
            {view !== "forgot" && (
              <div className="px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs font-semibold text-primary">
                  Plan {plan === "annuel" ? "Annuel" : "Mensuel"} — {plan === "annuel" ? "9,99€/mois" : "11,99€/mois"}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{titles[view]}</h1>
            <p className="text-sm text-muted">{subtitles[view]}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name fields — signup only */}
            {view === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Nom"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
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

            {view !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Mot de passe
                  </label>
                  {view === "login" && (
                    <button
                      type="button"
                      onClick={() => switchView("forgot")}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
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
            )}

            {error && (
              <div className="text-sm text-danger bg-danger/10 px-4 py-3 rounded-xl animate-fade-in">
                <p>{error}</p>
                {error.includes("Inscris-toi") && (
                  <button
                    type="button"
                    onClick={() => switchView("signup")}
                    className="mt-1 text-primary font-semibold text-xs hover:underline"
                  >
                    Créer un compte
                  </button>
                )}
                {error.includes("réinitialise") && (
                  <button
                    type="button"
                    onClick={() => switchView("forgot")}
                    className="mt-1 text-primary font-semibold text-xs hover:underline"
                  >
                    Réinitialiser le mot de passe
                  </button>
                )}
              </div>
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
              ) : view === "forgot" ? (
                <>
                  <Mail className="w-4 h-4" />
                  Envoyer le lien
                </>
              ) : (
                <>
                  {view === "login" ? "Se connecter" : "Créer mon compte"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            {view === "login" && (
              <>
                Pas encore de compte ?{" "}
                <button onClick={() => switchView("signup")} className="text-primary font-semibold hover:underline">
                  S&apos;inscrire
                </button>
              </>
            )}
            {view === "signup" && (
              <>
                Déjà un compte ?{" "}
                <button onClick={() => switchView("login")} className="text-primary font-semibold hover:underline">
                  Se connecter
                </button>
              </>
            )}
            {view === "forgot" && (
              <>
                Retour à la{" "}
                <button onClick={() => switchView("login")} className="text-primary font-semibold hover:underline">
                  connexion
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
