"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Crown,
  Check,
  ArrowRight,
  Shield,
  Clock,
  CreditCard,
  Loader2,
} from "lucide-react";

type Plan = "mensuel" | "annuel";

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("mensuel");
  const [annualPayment, setAnnualPayment] = useState<"monthly" | "once">("monthly");
  const [loading, setLoading] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    checkTrial();
  }, []);

  async function checkTrial() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const createdAt = new Date(user.created_at);
    const trialEnd = new Date(createdAt);
    trialEnd.setMonth(trialEnd.getMonth() + 1);

    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    setDaysLeft(Math.max(0, days));
    setTrialExpired(now >= trialEnd);
  }

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          annual_payment: selectedPlan === "annuel" ? annualPayment : undefined,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        {trialExpired ? (
          <>
            <h1 className="text-2xl md:text-3xl font-bold">
              Ton essai gratuit est <span className="text-danger">terminé</span>
            </h1>
            <p className="text-muted max-w-md mx-auto">
              Choisis un abonnement pour continuer à utiliser Orga&apos;Scol
              et accéder à toutes les fonctionnalités.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl md:text-3xl font-bold">
              Choisis ton <span className="text-primary">abonnement</span>
            </h1>
            <p className="text-muted max-w-md mx-auto">
              {daysLeft > 0 ? (
                <>Il te reste <strong>{daysLeft} jours</strong> d&apos;essai gratuit. Anticipe et choisis ton plan dès maintenant.</>
              ) : (
                <>Sélectionne le plan qui te convient pour continuer.</>
              )}
            </p>
          </>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mensuel */}
        <button
          onClick={() => setSelectedPlan("mensuel")}
          className={`text-left bg-card-bg border-2 rounded-2xl p-6 space-y-4 transition-all ${
            selectedPlan === "mensuel"
              ? "border-primary shadow-lg shadow-primary/10"
              : "border-border hover:border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Mensuel</h3>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedPlan === "mensuel" ? "border-primary bg-primary" : "border-border"
            }`}>
              {selectedPlan === "mensuel" && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">11,99€</span>
            <span className="text-muted">/mois</span>
          </div>
          <p className="text-sm text-muted">Flexible, résiliable à tout moment. Parfait pour tester au-delà de l&apos;essai.</p>
          <ul className="space-y-2">
            {[
              "Toutes les fonctionnalités",
              "Résiliable à tout moment",
              "Paiement mensuel",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-3.5 h-3.5 text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </button>

        {/* Annuel */}
        <button
          onClick={() => setSelectedPlan("annuel")}
          className={`relative text-left bg-card-bg border-2 rounded-2xl p-6 space-y-4 transition-all ${
            selectedPlan === "annuel"
              ? "border-primary shadow-lg shadow-primary/10"
              : "border-border hover:border-primary/30"
          }`}
        >
          <div className="absolute -top-3 left-4 px-3 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
            -17%
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Annuel</h3>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedPlan === "annuel" ? "border-primary bg-primary" : "border-border"
            }`}>
              {selectedPlan === "annuel" && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">9,99€</span>
            <span className="text-muted">/mois</span>
          </div>
          <p className="text-sm text-muted">Engagement année scolaire (10 mois). Le meilleur prix.</p>
          <ul className="space-y-2">
            {[
              "Toutes les fonctionnalités",
              "Économise 2 mois vs mensuel",
              "99,90€ l'année scolaire",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-3.5 h-3.5 text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </button>
      </div>

      {/* Annual payment option */}
      {selectedPlan === "annuel" && (
        <div className="bg-card-bg border border-border rounded-2xl p-5 space-y-3 animate-fade-in">
          <p className="text-sm font-semibold">Mode de paiement annuel</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setAnnualPayment("monthly")}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                annualPayment === "monthly"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-semibold">Mensuel</p>
              <p className="text-xs text-muted mt-1">9,99€/mois pendant 10 mois</p>
            </button>
            <button
              onClick={() => setAnnualPayment("once")}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                annualPayment === "once"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-semibold">En une fois</p>
              <p className="text-xs text-muted mt-1">99,90€ - un seul paiement</p>
            </button>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="space-y-4">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary-hover transition-colors btn-magnetic disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CreditCard className="w-5 h-5" />
          )}
          {loading
            ? "Redirection vers Stripe..."
            : selectedPlan === "annuel" && annualPayment === "once"
              ? "Payer 99,90€"
              : `S'abonner - ${selectedPlan === "annuel" ? "9,99" : "11,99"}€/mois`}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>

        <div className="flex items-center justify-center gap-6 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Paiement sécurisé Stripe
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {selectedPlan === "mensuel" ? "Résiliable à tout moment" : "Engagement 10 mois"}
          </span>
        </div>
      </div>
    </div>
  );
}
