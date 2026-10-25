import Link from "next/link";
import { GraduationCap, Calendar, Brain, Bell } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card-bg">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold">Orga&apos;Scol</span>
        </div>
        <Link
          href="/auth"
          className="px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
        >
          Commencer
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-2xl text-center space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Planifie tes révisions,{" "}
            <span className="text-primary">réussis tes examens</span>
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto">
            Ajoute tes examens et tes cours, renseigne ton emploi du temps, et
            laisse Orga&apos;Scol générer ton planning de révision optimal.
          </p>
          <Link
            href="/auth"
            className="inline-flex px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors text-base"
          >
            Créer mon compte gratuitement
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full px-4 stagger-children">
          <div className="bg-card-bg border border-border rounded-xl p-6 space-y-3 card-interactive">
            <Calendar className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-lg">Planning automatique</h3>
            <p className="text-sm text-muted">
              Un planning de révision généré selon tes disponibilités et la date
              de chaque examen.
            </p>
          </div>
          <div className="bg-card-bg border border-border rounded-xl p-6 space-y-3 card-interactive">
            <Brain className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-lg">Méthodes efficaces</h3>
            <p className="text-sm text-muted">
              Répétition espacée, révision active, relecture finale — des
              techniques prouvées par la science.
            </p>
          </div>
          <div className="bg-card-bg border border-border rounded-xl p-6 space-y-3 card-interactive">
            <Bell className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-lg">Alertes & suivi</h3>
            <p className="text-sm text-muted">
              Suis ta progression par matière et reçois des rappels pour ne
              jamais prendre de retard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
