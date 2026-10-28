"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CreditCard,
  Calendar,
  Crown,
  AlertTriangle,
  Check,
  Clock,
  Shield,
  RefreshCw,
  XCircle,
} from "lucide-react";
import ConfirmDialog from "@/components/confirm-dialog";

type Plan = "mensuel" | "annuel";
type Status = "trial" | "active" | "cancelled" | "expired";

interface Subscription {
  plan: Plan;
  status: Status;
  startDate: string;
  trialEnd: string;
  nextBilling: string | null;
  endDate: string | null;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
}

function getStatusLabel(status: Status) {
  switch (status) {
    case "trial": return { label: "Essai gratuit", color: "text-primary bg-primary/10" };
    case "active": return { label: "Actif", color: "text-success bg-success/10" };
    case "cancelled": return { label: "Rsilié", color: "text-warning bg-warning/10" };
    case "expired": return { label: "Expiré", color: "text-danger bg-danger/10" };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // For now, simulate subscription data based on user metadata
    // This will be replaced with real Stripe data later
    const createdAt = user.created_at;
    const startDate = new Date(createdAt);
    const trialEnd = new Date(startDate);
    trialEnd.setMonth(trialEnd.getMonth() + 1);

    const now = new Date();
    const isInTrial = now < trialEnd;

    const plan = (user.user_metadata?.plan as Plan) || "mensuel";

    const nextBillingDate = new Date(trialEnd);
    if (!isInTrial) {
      nextBillingDate.setTime(now.getTime());
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      nextBillingDate.setDate(trialEnd.getDate());
    }

    setSub({
      plan,
      status: isInTrial ? "trial" : "active",
      startDate: startDate.toISOString(),
      trialEnd: trialEnd.toISOString(),
      nextBilling: nextBillingDate.toISOString(),
      endDate: plan === "annuel" ? new Date(startDate.getFullYear(), startDate.getMonth() + 11, startDate.getDate()).toISOString() : null,
      card: null,
    });

    setLoading(false);
  }

  async function handleCancel() {
    setCancelling(true);
    // Placeholder — will call Stripe cancel endpoint
    await new Promise((r) => setTimeout(r, 1000));
    if (sub) {
      setSub({ ...sub, status: "cancelled" });
    }
    setCancelling(false);
    setShowCancel(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!sub) return null;

  const statusInfo = getStatusLabel(sub.status);
  const trialDays = daysUntil(sub.trialEnd);
  const price = sub.plan === "annuel" ? "49,99" : "5,99";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Abonnement</h1>
        <p className="text-muted text-sm mt-1">Gère ton abonnement et ton moyen de paiement</p>
      </div>

      {/* Trial banner */}
      {sub.status === "trial" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
          <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Période d&apos;essai en cours</p>
            <p className="text-xs text-muted mt-0.5">
              Il te reste <strong>{trialDays} jours</strong> d&apos;essai gratuit.
              Le paiement commencera le <strong>{formatDate(sub.trialEnd)}</strong>.
            </p>
          </div>
        </div>
      )}

      {sub.status === "cancelled" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Abonnement résilié</p>
            <p className="text-xs text-muted mt-0.5">
              Ton accès reste actif jusqu&apos;à la fin de la période en cours.
            </p>
          </div>
        </div>
      )}

      {/* Current plan */}
      <div className="bg-card-bg border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-light">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold">Mon plan</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{price}€</span>
          <span className="text-muted">{sub.plan === "annuel" ? "/an" : "/mois"}</span>
          <span className="ml-2 px-2.5 py-0.5 rounded-full bg-primary-light text-primary text-xs font-semibold capitalize">
            {sub.plan === "annuel" ? "Annuel" : "Mensuel"}
          </span>
        </div>

        {sub.plan === "annuel" && (
          <p className="text-xs text-muted">
            49,99€/an - paiement en une fois, soit 4,17€/mois
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-muted uppercase tracking-wider font-medium">Date d&apos;inscription</p>
            <p className="text-sm font-medium">{formatDate(sub.startDate)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted uppercase tracking-wider font-medium">Fin de l&apos;essai gratuit</p>
            <p className="text-sm font-medium">{formatDate(sub.trialEnd)}</p>
          </div>
          {sub.nextBilling && sub.status !== "cancelled" && (
            <div className="space-y-1">
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Prochain paiement</p>
              <p className="text-sm font-medium">{formatDate(sub.nextBilling)}</p>
            </div>
          )}
          {sub.plan === "annuel" && sub.endDate && (
            <div className="space-y-1">
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Fin de l&apos;engagement</p>
              <p className="text-sm font-medium">{formatDate(sub.endDate)}</p>
            </div>
          )}
        </div>

        {/* Plan features */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted font-medium mb-3">Inclus dans ton abonnement</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Planning de révision illimité",
              "Import emploi du temps iCal",
              "Notes & moyennes par UE",
              "Alertes intelligentes",
              "Méthodes de révision",
              "Gestion des projets",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-3.5 h-3.5 text-success shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-card-bg border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-light">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold">Moyen de paiement</h2>
        </div>

        {sub.card ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded bg-foreground/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium capitalize">{sub.card.brand} •••• {sub.card.last4}</p>
                <p className="text-xs text-muted">Expire {String(sub.card.expMonth).padStart(2, "0")}/{sub.card.expYear}</p>
              </div>
            </div>
            <button className="text-sm text-primary font-medium hover:underline">
              Modifier
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-background border border-dashed border-border text-center space-y-3">
            <CreditCard className="w-8 h-8 text-muted mx-auto" />
            <div>
              <p className="text-sm font-medium">Aucun moyen de paiement</p>
              <p className="text-xs text-muted mt-0.5">
                {sub.status === "trial"
                  ? "Tu pourras ajouter ta carte avant la fin de l'essai gratuit."
                  : "Ajoute une carte pour continuer ton abonnement."}
              </p>
            </div>
            <a
              href="/upgrade"
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors btn-press"
            >
              <CreditCard className="w-4 h-4" />
              Ajouter une carte
            </a>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted">
          <Shield className="w-3.5 h-3.5" />
          Paiements sécurisés par Stripe. Nous ne stockons jamais tes données bancaires.
        </div>
      </div>

      {/* Billing history */}
      <div className="bg-card-bg border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-light">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold">Historique de facturation</h2>
        </div>

        <div className="p-4 rounded-xl bg-background border border-dashed border-border text-center">
          <p className="text-sm text-muted">Aucune facture pour le moment</p>
          <p className="text-xs text-muted mt-1">
            Les factures apparaîtront ici après ton premier paiement.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card-bg border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-light">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold">Gérer l&apos;abonnement</h2>
        </div>

        <div className="space-y-3">
          {sub.plan === "mensuel" && sub.status !== "cancelled" && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
              <div>
                <p className="text-sm font-medium">Passer au plan Annuel</p>
                <p className="text-xs text-muted">Économise 30% - 49,99€/an au lieu de 71,88€</p>
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors btn-press">
                Changer
              </button>
            </div>
          )}

          {sub.plan === "annuel" && sub.status !== "cancelled" && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
              <div>
                <p className="text-sm font-medium">Passer au plan Mensuel</p>
                <p className="text-xs text-muted">À la fin de ton engagement actuel</p>
              </div>
              <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-background transition-colors btn-press">
                Changer
              </button>
            </div>
          )}

          {sub.status !== "cancelled" ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-danger/5 border border-danger/20">
              <div>
                <p className="text-sm font-medium">Résilier l&apos;abonnement</p>
                <p className="text-xs text-muted">
                  {sub.plan === "annuel"
                    ? "L'engagement annuel n'est pas résiliable avant la fin de la période."
                    : "Tu conserves l'accès jusqu'à la fin du mois en cours."}
                </p>
              </div>
              <button
                onClick={() => setShowCancel(true)}
                disabled={sub.plan === "annuel" && sub.status === "active"}
                className="px-4 py-2 border border-danger/30 text-danger rounded-lg text-sm font-medium hover:bg-danger/10 transition-colors btn-press disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Résilier
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-warning" />
                <p className="text-sm font-medium">Abonnement résilié</p>
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors btn-press">
                Réactiver
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showCancel}
        title="Résilier l'abonnement"
        message="Es-tu sûr de vouloir résilier ton abonnement ? Tu conserveras l'accès jusqu'à la fin de la période en cours."
        confirmLabel={cancelling ? "Résiliation..." : "Résilier"}
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
      />
    </div>
  );
}
