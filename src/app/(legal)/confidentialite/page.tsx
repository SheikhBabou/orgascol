import {
  Lock,
  Database,
  Eye,
  Share2,
  Clock,
  UserCheck,
  ShieldCheck,
  Mail,
} from "lucide-react";

const sections = [
  {
    num: "01",
    icon: Database,
    title: "Données collectées",
    content: (
      <>
        <p className="font-medium text-foreground">Lors de l&apos;inscription</p>
        <ul>
          <li>Prénom et nom</li>
          <li>Adresse email</li>
          <li>Mot de passe (chiffré, jamais stocké en clair)</li>
          <li>Plan choisi (mensuel ou annuel)</li>
          <li>Niveau d&apos;études - optionnel (Licence, Master, BTS, Prépa, DUT/BUT, Doctorat, Lycée, etc.)</li>
          <li>Filière / intitulé de formation - optionnel (ex : Droit, Informatique, Commerce, etc.)</li>
        </ul>
        <p className="font-medium text-foreground pt-2">Lors de l&apos;utilisation</p>
        <ul>
          <li>Matières, examens, chapitres et progression</li>
          <li>Emploi du temps (saisi manuellement ou importé via iCal)</li>
          <li>Notes, moyennes et coefficients ECTS</li>
          <li>Projets et échéances</li>
          <li>Sessions de révision générées et leur statut</li>
        </ul>
        <p className="font-medium text-foreground pt-2">Données techniques</p>
        <ul>
          <li>Préférences d&apos;affichage (thème clair/sombre) stockées localement dans votre navigateur</li>
          <li>Cookies techniques strictement nécessaires (authentification)</li>
        </ul>
      </>
    ),
  },
  {
    num: "02",
    icon: Eye,
    title: "Utilisation des données",
    content: (
      <>
        <p>Tes données sont utilisées uniquement pour :</p>
        <ul>
          <li><strong>Fonctionnement du service :</strong> Générer ton planning de révision, calculer tes moyennes, suivre ta progression.</li>
          <li><strong>Personnalisation :</strong> Adapter le contenu et les recommandations à ton niveau d&apos;études et ta filière.</li>
          <li><strong>Gestion de compte :</strong> Authentification, gestion de l&apos;abonnement et du paiement.</li>
          <li><strong>Alertes :</strong> T&apos;envoyer des notifications importantes (examens proches, échéances projets).</li>
          <li><strong>Amélioration :</strong> Analyser l&apos;utilisation du service pour l&apos;améliorer (statistiques anonymisées).</li>
        </ul>
        <p>
          Nous ne faisons <strong>aucun profilage publicitaire</strong> et ne vendons
          jamais vos données à des tiers.
        </p>
      </>
    ),
  },
  {
    num: "03",
    icon: Share2,
    title: "Partage des données",
    content: (
      <>
        <p>Nous ne vendons jamais tes données. Elles peuvent être partagées uniquement avec :</p>
        <ul>
          <li><strong>Supabase :</strong> Base de données et authentification (hébergement UE/US).</li>
          <li><strong>Vercel :</strong> Hébergement de l&apos;application (US).</li>
          <li><strong>Stripe :</strong> Traitement sécurisé des paiements (US). Stripe ne nous transmet que les 4 derniers chiffres de votre carte.</li>
        </ul>
        <p>
          Ces prestataires sont soumis à des obligations contractuelles de confidentialité
          et de protection des données conformes au RGPD.
        </p>
      </>
    ),
  },
  {
    num: "04",
    icon: Clock,
    title: "Durée de conservation",
    content: (
      <>
        <ul>
          <li><strong>Compte actif :</strong> Tes données sont conservées tant que ton compte est actif.</li>
          <li><strong>Compte supprimé :</strong> Suppression définitive sous 30 jours, sauf obligations légales.</li>
          <li><strong>Logs de sécurité :</strong> Conservés 12 mois maximum pour des raisons de sécurité.</li>
        </ul>
      </>
    ),
  },
  {
    num: "05",
    icon: UserCheck,
    title: "Tes droits",
    content: (
      <>
        <p>Conformément au RGPD, tu disposes des droits suivants :</p>
        <ul>
          <li><strong>Accès :</strong> Demander une copie de toutes tes données personnelles.</li>
          <li><strong>Rectification :</strong> Corriger des informations inexactes ou incomplètes.</li>
          <li><strong>Suppression :</strong> Demander la suppression de ton compte et de tes données.</li>
          <li><strong>Portabilité :</strong> Recevoir tes données dans un format structuré et lisible.</li>
          <li><strong>Opposition :</strong> T&apos;opposer à certains traitements (marketing, etc.).</li>
        </ul>
        <p>
          Pour exercer ces droits, contacte-nous à : <strong>contact@orgascol.fr</strong>
        </p>
      </>
    ),
  },
  {
    num: "06",
    icon: ShieldCheck,
    title: "Sécurité des données",
    content: (
      <>
        <ul>
          <li>Chiffrement SSL/TLS de toutes les communications</li>
          <li>Mots de passe hashés (jamais stockés en clair)</li>
          <li>Isolation des données par utilisateur (Row Level Security)</li>
          <li>Hébergement sécurisé avec certificats SSL</li>
          <li>Aucun cookie publicitaire ou de traçage</li>
        </ul>
      </>
    ),
  },
];

export default function ConfidentialitePage() {
  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="text-center space-y-4 pb-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Politique de <span className="text-primary">confidentialité</span>
        </h1>
        <p className="text-muted max-w-lg mx-auto">
          Ta vie privée est importante. Découvre comment nous protégeons tes données personnelles sur Orga&apos;Scol.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((s) => (
          <div key={s.num} className="bg-card-bg border border-border rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary">{s.num}</span>
                <h2 className="text-lg font-bold">{s.title}</h2>
              </div>
            </div>
            <div className="legal-content text-sm text-muted leading-relaxed space-y-3 pl-0 md:pl-16">
              {s.content}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-8 md:p-10 text-center text-white space-y-4">
        <h3 className="text-xl font-bold">Une question sur tes données ?</h3>
        <p className="text-white/70 text-sm max-w-md mx-auto">
          Notre équipe est disponible pour répondre à toutes tes questions sur la protection de tes données.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow"
        >
          <Mail className="w-4 h-4" />
          Contacter
        </a>
        <p className="text-xs text-white/40 pt-2">Dernière mise à jour : Octobre 2026</p>
      </div>
    </div>
  );
}
