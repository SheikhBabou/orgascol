"use client";

import { useEffect } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UpgradeSuccessPage() {
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.refreshSession();
  }, []);

  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-12">
      <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center animate-fade-in">
        <CheckCircle2 className="w-10 h-10 text-success" />
      </div>

      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <h1 className="text-2xl font-bold">Abonnement activé !</h1>
        <p className="text-muted">
          Merci pour ta confiance. Ton abonnement est maintenant actif et tu as
          accès à toutes les fonctionnalités d&apos;Orga&apos;Scol.
        </p>
      </div>

      <div className="bg-card-bg border border-border rounded-2xl p-6 text-left space-y-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <p className="text-sm font-semibold">Prochaines étapes</p>
        <ul className="space-y-2">
          {[
            "Ajoute tes matières et examens",
            "Importe ton emploi du temps",
            "Génère ton planning de révision",
          ].map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      <a
        href="/dashboard"
        className="group inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-semibold btn-magnetic animate-fade-in"
        style={{ animationDelay: "0.3s" }}
      >
        Aller au dashboard
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </a>
    </div>
  );
}
