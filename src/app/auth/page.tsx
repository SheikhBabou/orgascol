"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { GraduationCap, ArrowRight, Loader2, Mail, Star } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}

type View = "login" | "signup" | "forgot";

const AVIS = [
  { name: "Sarah M.", role: "L3 Droit - Paris", text: "J'ai validé mon semestre sans stress. Le planning automatique m'a fait gagner un temps fou !" },
  { name: "Amine K.", role: "Prépa MPSI - Lyon", text: "Les rappels au bon moment, c'est exactement ce qu'il me fallait. Mes notes ont grimpé de 3 points." },
  { name: "Chloé D.", role: "M1 Psychologie - Bordeaux", text: "Je recommande à 100%. L'organisation de mes révisions n'a jamais été aussi simple." },
  { name: "Youssef B.", role: "BTS Commerce - Marseille", text: "En 2 semaines, j'ai rattrapé tout mon retard. L'algorithme sait quand réviser chaque matière." },
  { name: "Léa T.", role: "PASS Médecine - Lille", text: "Indispensable pour la PASS. Le planning s'adapte quand je prends du retard, c'est génial." },
];

const FORMATIONS = [
  "Licence 1", "Licence 2", "Licence 3",
  "Master 1", "Master 2",
  "BTS", "DUT / BUT", "Prépa",
  "Doctorat", "Lycée", "Autre",
];

function AuthContent() {
  const [view, setView] = useState<View>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formation, setFormation] = useState("");
  const [formationName, setFormationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [avisIndex, setAvisIndex] = useState(0);
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const supabase = createClient();

  useEffect(() => {
    const timer = setInterval(() => {
      setAvisIndex((prev) => (prev + 1) % AVIS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
          setError("Email ou mot de passe incorrect. Vérifie tes identifiants ou réinitialise ton mot de passe.");
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
            ...(formation && { formation }),
            ...(formationName && { formation_name: formationName }),
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
      ? "15 jours gratuits, puis 49,99€/an. Aucune carte bancaire requise."
      : "15 jours gratuits, puis 5,99€/mois. Aucune carte bancaire requise.",
    forgot: "Entre ton email et on t'envoie un lien de réinitialisation.",
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — photo + avis */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-primary/30" />

        {/* Top — logo + titre */}
        <div className="relative space-y-4 animate-hero-text">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="w-10 h-10 text-white" />
            <span className="text-2xl font-bold text-white">Orga&apos;Scol</span>
          </Link>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Organise tes révisions,<br />
            <span style={{ color: "#c4b5fd" }}>sérénité assurée.</span>
          </h2>
        </div>

        {/* Bottom — avis carousel */}
        <div className="relative space-y-3">
          <div className="overflow-hidden rounded-xl" style={{ height: "100px" }}>
            <div
              className="transition-transform duration-700 ease-in-out"
              style={{ transform: `translateY(-${avisIndex * 100}px)` }}
            >
              {AVIS.map((avis) => (
                <div
                  key={avis.name}
                  className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl"
                  style={{ height: "100px" }}
                >
                  <div className="flex items-center gap-1 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed mb-2">
                    {avis.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/60 flex items-center justify-center text-[10px] font-bold text-white">
                      {avis.name.charAt(0)}
                    </div>
                    <p className="text-xs text-white/70">
                      <span className="font-semibold text-white">{avis.name}</span> · {avis.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: ["#7c3aed", "#6d28d9", "#8b5cf6", "#a78bfa"][i] }}
                  />
                ))}
              </div>
              <p className="text-xs text-white/60">
                <span className="text-white font-semibold">+2 000</span> étudiants
              </p>
            </div>
            <div className="flex gap-1.5">
              {AVIS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvisIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-500 cursor-pointer ${
                    i === avisIndex ? "bg-white scale-125" : "bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="lg:hidden mb-4">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Orga&apos;Scol</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{titles[view]}</h1>
            <p className="text-sm text-muted">{subtitles[view]}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name fields — signup only */}
            {view === "signup" && (
              <>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="formation" className="block text-sm font-medium mb-1.5">
                      Niveau <span className="text-muted font-normal">(optionnel)</span>
                    </label>
                    <select
                      id="formation"
                      value={formation}
                      onChange={(e) => setFormation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      <option value="">Sélectionner</option>
                      {FORMATIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="formationName" className="block text-sm font-medium mb-1.5">
                      Filière <span className="text-muted font-normal">(optionnel)</span>
                    </label>
                    <input
                      id="formationName"
                      type="text"
                      value={formationName}
                      onChange={(e) => setFormationName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder="Ex: Droit, Info..."
                    />
                  </div>
                </div>
              </>
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
