"use client";

import { useState } from "react";
import { GraduationCap, X, ExternalLink } from "lucide-react";

const footerPages: Record<string, { title: string; href: string; content: React.ReactNode }> = {
  "mentions-legales": {
    title: "Mentions légales",
    href: "/mentions-legales",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Nom du service", value: "Orga'Scol" },
            { label: "Statut", value: "Micro-entreprise" },
            { label: "Pays", value: "France" },
            { label: "Email de contact", value: "contact@orgascol.fr" },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/40">{label}</p>
              <p className="font-semibold text-sm text-white mt-1">{value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold text-white/80">Hébergement</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="font-semibold text-sm text-white">Vercel Inc.</p>
              <p className="text-xs text-white/40 mt-1">Hébergement de l&apos;application</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="font-semibold text-sm text-white">Supabase Inc.</p>
              <p className="text-xs text-white/40 mt-1">Base de données &amp; authentification</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm text-white/50 leading-relaxed">
          <p>L&apos;ensemble du contenu du site est protégé par le droit d&apos;auteur. Toute reproduction est interdite sans autorisation.</p>
          <p>Les présentes mentions sont régies par le droit français. En cas de litige, les tribunaux compétents seront ceux du ressort du siège social de l&apos;éditeur.</p>
        </div>
      </div>
    ),
  },
  confidentialite: {
    title: "Politique de confidentialité",
    href: "/confidentialite",
    content: (
      <div className="space-y-4 text-sm text-white/50 leading-relaxed">
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Données collectées</h4>
          <p>Email, mot de passe (chiffré), plan choisi, matières, examens, notes, emploi du temps, projets et sessions de révision.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Utilisation</h4>
          <p>Tes données servent uniquement au fonctionnement du service (planning, moyennes, alertes). Aucun profilage publicitaire, jamais de vente à des tiers.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Prestataires</h4>
          <p>Supabase (BDD), Vercel (hébergement), Stripe (paiements). Tous conformes au RGPD.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Tes droits</h4>
          <p>Accès, rectification, suppression, portabilité. Contacte contact@orgascol.fr pour exercer ces droits.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Sécurité</h4>
          <p>Chiffrement SSL/TLS, mots de passe hashés, Row Level Security, aucun cookie publicitaire.</p>
        </div>
      </div>
    ),
  },
  cgu: {
    title: "Conditions Générales d'Utilisation",
    href: "/cgu",
    content: (
      <div className="space-y-4 text-sm text-white/50 leading-relaxed">
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Tarifs</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="font-semibold text-sm text-white">Mensuel — 11,99€/mois</p>
              <p className="text-xs text-white/40 mt-1">Résiliable à tout moment</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/20 border border-primary/30">
              <p className="font-semibold text-sm text-white">Annuel — 9,99€/mois</p>
              <p className="text-xs text-white/40 mt-1">99,90€ sur 10 mois</p>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Essai gratuit</h4>
          <p>1 mois gratuit dès l&apos;inscription. Aucune carte bancaire requise. Premier paiement 30 jours après l&apos;inscription.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Résiliation</h4>
          <p>Mensuel : résiliable à tout moment, accès jusqu&apos;à la fin du mois. Annuel : engagement sur l&apos;année scolaire (10 mois).</p>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Remboursements</h4>
          <p>Possibles en cas de problème technique majeur, double facturation ou fermeture injustifiée. Demande sous 30 jours à contact@orgascol.fr.</p>
        </div>
      </div>
    ),
  },
  faq: {
    title: "Questions fréquentes",
    href: "/faq",
    content: (
      <div className="space-y-4 text-sm text-white/50 leading-relaxed">
        {[
          { q: "Comment fonctionne l'essai gratuit ?", a: "1 mois gratuit dès l'inscription. Toutes les fonctionnalités accessibles. Aucune carte bancaire requise." },
          { q: "Quels sont les tarifs ?", a: "Mensuel à 11,99€/mois (résiliable) ou Annuel à 9,99€/mois soit 99,90€ l'année scolaire (10 mois)." },
          { q: "Comment annuler mon abonnement ?", a: "Mensuel : depuis la page Abonnement en un clic. Annuel : engagement sur l'année scolaire." },
          { q: "Comment fonctionne le planning ?", a: "Ajoute tes examens et dates, génère ton planning. Orga'Scol répartit les sessions avec la répétition espacée." },
          { q: "Comment importer mon emploi du temps ?", a: "Colle ton lien iCal depuis ton ENT ou Google Calendar. Import en un clic." },
          { q: "Mes données sont-elles protégées ?", a: "Chiffrement SSL/TLS, mots de passe hashés, Row Level Security. Aucun cookie publicitaire." },
        ].map(({ q, a }) => (
          <div key={q} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="font-semibold text-sm text-white">{q}</p>
            <p className="text-xs text-white/40 mt-2">{a}</p>
          </div>
        ))}
      </div>
    ),
  },
  contact: {
    title: "Contact",
    href: "/contact",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/40">Email</p>
            <p className="font-semibold text-sm text-white mt-1">contact@orgascol.fr</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/40">Délai de réponse</p>
            <p className="font-semibold text-sm text-white mt-1">Sous 24-48h ouvrées</p>
          </div>
        </div>
        <p className="text-sm text-white/50">
          Pour un formulaire de contact complet, visite la page dédiée.
        </p>
      </div>
    ),
  },
};

export default function Footer() {
  const [activePage, setActivePage] = useState<string | null>(null);

  function handleClick(key: string) {
    setActivePage((prev) => (prev === key ? null : key));
  }

  const activeData = activePage ? footerPages[activePage] : null;

  return (
    <footer className="bg-foreground text-background rounded-t-[3rem] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Expanded content panel */}
        {activeData && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{activeData.title}</h3>
              <div className="flex items-center gap-3">
                <a
                  href={activeData.href}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-primary transition-colors"
                >
                  Page complète
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setActivePage(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {activeData.content}
            </div>
            <div className="mt-6 pt-6 border-t border-white/10" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold">Orga&apos;Scol</span>
            </a>
            <p className="text-sm text-white/40 max-w-xs">
              L&apos;outil de planification de révisions qui aide les étudiants
              à s&apos;organiser et réussir.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
              <span className="text-xs font-mono text-white/40">Système opérationnel</span>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white/60 uppercase tracking-wider">Navigation</h4>
            <div className="space-y-2">
              {[
                { label: "Accueil", anchor: "#" },
                { label: "Comment ça marche", anchor: "#fonctionnalités" },
                { label: "Tarifs", anchor: "#tarifs" },
              ].map(({ label, anchor }) => (
                <a key={label} href={anchor} className="block text-sm text-white/40 hover:text-white transition-colors">
                  {label}
                </a>
              ))}
              {(["faq", "contact"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => handleClick(key)}
                  className={`block text-sm transition-colors text-left ${
                    activePage === key ? "text-primary font-medium" : "text-white/40 hover:text-white"
                  }`}
                >
                  {footerPages[key].title}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white/60 uppercase tracking-wider">Légal</h4>
            <div className="space-y-2">
              {(["mentions-legales", "confidentialite", "cgu"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => handleClick(key)}
                  className={`block text-sm transition-colors text-left ${
                    activePage === key ? "text-primary font-medium" : "text-white/40 hover:text-white"
                  }`}
                >
                  {footerPages[key].title}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Orga&apos;Scol. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
