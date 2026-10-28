"use client";

import { useState } from "react";
import {
  HelpCircle,
  Search,
  UserPlus,
  CreditCard,
  Calendar,
  ShieldCheck,
  ChevronDown,
  Mail,
} from "lucide-react";

const categories = [
  {
    name: "Inscription et compte",
    icon: UserPlus,
    questions: [
      {
        q: "Comment créer un compte sur Orga'Scol ?",
        a: "Clique sur « Commencer » depuis la page d'accueil, renseigne ton email et un mot de passe. Ton compte est créé immédiatement avec 1 mois d'essai gratuit.",
      },
      {
        q: "Puis-je modifier mon email ou mot de passe ?",
        a: "Oui, tu peux modifier tes informations depuis la page Paramètres de ton espace personnel à tout moment.",
      },
      {
        q: "Comment supprimer mon compte ?",
        a: "Contacte-nous à contact@orgascol.fr avec ta demande de suppression. Ton compte et toutes tes données seront supprimés définitivement sous 30 jours.",
      },
    ],
  },
  {
    name: "Essai gratuit et abonnement",
    icon: CreditCard,
    questions: [
      {
        q: "Comment fonctionne l'essai gratuit ?",
        a: "Tu bénéficies de 1 mois d'essai gratuit dès ton inscription. Toutes les fonctionnalités sont accessibles. Aucune carte bancaire n'est requise pendant l'essai.",
      },
      {
        q: "Que se passe-t-il à la fin de l'essai ?",
        a: "À la fin des 30 jours, tu choisis un abonnement (mensuel ou annuel) pour continuer. Sans abonnement, ton compte reste actif mais les fonctionnalités sont suspendues.",
      },
      {
        q: "Quels sont les tarifs ?",
        a: "Deux formules : Mensuel à 5,99€/mois (résiliable à tout moment) ou Annuel à 49,99€ payé en une fois (soit 4,17€/mois).",
      },
      {
        q: "Comment annuler mon abonnement ?",
        a: "Pour le mensuel, va dans Abonnement depuis ton espace et résilie en un clic. L'accès reste actif jusqu'à la fin du mois en cours. L'annuel est un engagement sur 12 mois.",
      },
      {
        q: "Puis-je obtenir un remboursement ?",
        a: "Des remboursements sont possibles en cas de problème technique majeur, double facturation ou fermeture injustifiée de compte. Contacte-nous dans les 30 jours suivant l'incident.",
      },
    ],
  },
  {
    name: "Fonctionnalités",
    icon: Calendar,
    questions: [
      {
        q: "Comment fonctionne le planning de révision ?",
        a: "Ajoute tes examens avec leurs dates et chapitres, puis génère ton planning. Orga'Scol répartit automatiquement des sessions de révision sur tes créneaux libres en utilisant la répétition espacée.",
      },
      {
        q: "Comment importer mon emploi du temps ?",
        a: "Va dans la section Emploi du temps et colle ton lien iCal (disponible depuis ton ENT ou Google Calendar). Tes cours sont importés automatiquement en un clic.",
      },
      {
        q: "Comment sont calculées les moyennes ?",
        a: "Les moyennes sont calculées automatiquement par matière, par UE et en générale, pondérées par les coefficients ECTS que tu renseignes.",
      },
      {
        q: "Puis-je gérer mes projets et travaux de groupe ?",
        a: "Oui, tu peux ajouter tes projets avec leurs échéances. Le dashboard t'alerte automatiquement à J-5 de chaque deadline.",
      },
    ],
  },
  {
    name: "Données et sécurité",
    icon: ShieldCheck,
    questions: [
      {
        q: "Comment Orga'Scol protège mes données ?",
        a: "Toutes les communications sont chiffrées (SSL/TLS), les mots de passe sont hashés, et tes données sont isolées par utilisateur grâce au Row Level Security. Aucun cookie publicitaire n'est utilisé.",
      },
      {
        q: "Mes données sont-elles partagées avec des tiers ?",
        a: "Jamais vendues. Seuls nos prestataires techniques (Supabase, Vercel, Stripe) y accèdent dans le cadre strict du fonctionnement du service, conformément au RGPD.",
      },
      {
        q: "Puis-je récupérer ou supprimer mes données ?",
        a: "Oui, conformément au RGPD tu as un droit d'accès, de rectification, de suppression et de portabilité. Contacte-nous à contact@orgascol.fr pour exercer ces droits.",
      },
    ],
  },
];

const allQuestions = categories.flatMap((c) =>
  c.questions.map((q) => ({ ...q, category: c.name }))
);

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const normalise = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const filtered = search.trim()
    ? allQuestions.filter(
        (item) =>
          normalise(item.q).includes(normalise(search)) ||
          normalise(item.a).includes(normalise(search))
      )
    : null;

  function toggle(key: string) {
    setOpenIndex((prev) => (prev === key ? null : key));
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 pb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <HelpCircle className="w-4 h-4" />
          {allQuestions.length} réponses à tes questions
        </div>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <HelpCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Questions <span className="text-primary">fréquentes</span>
        </h1>
        <p className="text-muted max-w-lg mx-auto">
          Trouve rapidement les réponses à tes questions sur Orga&apos;Scol. Si tu ne trouves pas ce que tu cherches, contacte-nous !
        </p>

        {/* Search bar */}
        <div className="max-w-md mx-auto pt-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une question..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Search results */}
      {filtered !== null ? (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted">Aucun résultat pour &quot;{search}&quot;</p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
              >
                <Mail className="w-4 h-4" />
                Pose-nous ta question directement
              </a>
            </div>
          ) : (
            filtered.map((item) => {
              const key = `search-${item.q}`;
              const isOpen = openIndex === key;
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className="w-full text-left bg-card-bg border border-border rounded-2xl p-5 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{item.category}</span>
                      <p className="text-sm font-semibold mt-0.5">{item.q}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                  {isOpen && (
                    <p className="text-sm text-muted leading-relaxed mt-3 pt-3 border-t border-border">{item.a}</p>
                  )}
                </button>
              );
            })
          )}
        </div>
      ) : (
        /* Categories */
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <cat.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-bold text-lg">{cat.name}</h2>
              </div>
              {cat.questions.map((item) => {
                const key = `${cat.name}-${item.q}`;
                const isOpen = openIndex === key;
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    className="w-full text-left bg-card-bg border border-border rounded-2xl p-5 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold">{item.q}</p>
                      <ChevronDown className={`w-5 h-5 text-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                    {isOpen && (
                      <p className="text-sm text-muted leading-relaxed mt-3 pt-3 border-t border-border">{item.a}</p>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-8 md:p-10 text-center text-white space-y-4">
        <h3 className="text-xl font-bold">Tu n&apos;as pas trouvé ta réponse ?</h3>
        <p className="text-white/70 text-sm max-w-md mx-auto">
          Notre équipe est disponible pour t&apos;aider. Écris-nous et on te répond sous 24-48h.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow"
        >
          <Mail className="w-4 h-4" />
          Nous contacter
        </a>
      </div>
    </div>
  );
}
