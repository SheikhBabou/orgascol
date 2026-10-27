import {
  FileText,
  Target,
  Layers,
  CreditCard,
  Clock,
  XCircle,
  RotateCcw,
  RefreshCw,
  Shield,
  Scale,
  Mail,
} from "lucide-react";

const sections = [
  {
    num: "01",
    icon: Target,
    title: "Objet",
    content: (
      <>
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès
          et l&apos;utilisation du service Orga&apos;Scol, accessible à l&apos;adresse orgascol.fr.
        </p>
        <p>
          Orga&apos;Scol est une plateforme de planification de révisions destinée aux
          étudiants, éditée en France.
        </p>
        <p>
          En créant un compte, vous acceptez sans réserve les présentes CGU.
          L&apos;inscription requiert un prénom, un nom, une adresse email et un mot de passe.
          Le niveau d&apos;études et la filière sont facultatifs et servent à personnaliser le service.
        </p>
      </>
    ),
  },
  {
    num: "02",
    icon: Layers,
    title: "Description du service",
    content: (
      <>
        <p>L&apos;abonnement Orga&apos;Scol donne accès aux fonctionnalités suivantes :</p>
        <ul>
          <li><strong>Planning automatique :</strong> Génération de sessions de révision basées sur la répétition espacée, adaptées à vos disponibilités.</li>
          <li><strong>Gestion des examens :</strong> Ajout d&apos;examens, chapitres, et suivi de progression chapitre par chapitre.</li>
          <li><strong>Import emploi du temps :</strong> Importation de votre emploi du temps depuis un lien iCal en un clic.</li>
          <li><strong>Notes &amp; moyennes :</strong> Calcul automatique des moyennes par matière, par UE et générale pondérée par ECTS.</li>
          <li><strong>Gestion des projets :</strong> Suivi des projets, travaux de groupe et échéances.</li>
          <li><strong>Alertes intelligentes :</strong> Notifications J-5 pour vos examens et projets.</li>
        </ul>
      </>
    ),
  },
  {
    num: "03",
    icon: CreditCard,
    title: "Durée, tarifs et paiement",
    content: (
      <>
        <p>Deux formules d&apos;abonnement sont proposées :</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
          <div className="p-4 rounded-xl bg-background border border-border">
            <p className="font-semibold text-sm">Mensuel</p>
            <p className="text-2xl font-bold mt-1">11,99€<span className="text-sm font-normal text-muted">/mois</span></p>
            <p className="text-xs text-muted mt-1">Résiliable à tout moment</p>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="font-semibold text-sm text-primary">Annuel (année scolaire)</p>
            <p className="text-2xl font-bold mt-1">9,99€<span className="text-sm font-normal text-muted">/mois</span></p>
            <p className="text-xs text-muted mt-1">99,90€ sur 10 mois - paiement mensuel ou en une fois</p>
          </div>
        </div>
        <ul>
          <li><strong>Période d&apos;essai :</strong> 1 mois gratuit à compter de l&apos;inscription. Aucune carte bancaire requise pendant l&apos;essai.</li>
          <li><strong>Premier paiement :</strong> Intervient 30 jours après l&apos;inscription, à la fin de la période d&apos;essai.</li>
          <li><strong>Moyens de paiement :</strong> Carte bancaire (Visa, Mastercard) via Stripe. Les paiements sont sécurisés et chiffrés.</li>
        </ul>
        <p>Les tarifs peuvent être modifiés à tout moment. Les modifications n&apos;affectent pas les abonnements en cours.</p>
      </>
    ),
  },
  {
    num: "04",
    icon: Clock,
    title: "Renouvellement",
    content: (
      <>
        <ul>
          <li><strong>Abonnement Mensuel :</strong> Renouvelé automatiquement chaque mois. Vous pouvez annuler à tout moment depuis votre espace Abonnement.</li>
          <li><strong>Abonnement Annuel :</strong> Engagement sur l&apos;année scolaire (10 mois). Non résiliable avant la fin de la période. À l&apos;expiration, vous pouvez renouveler ou passer en mensuel.</li>
        </ul>
        <p>
          Aucun renouvellement n&apos;est effectué sans votre consentement explicite à l&apos;issue d&apos;un abonnement annuel.
        </p>
      </>
    ),
  },
  {
    num: "05",
    icon: XCircle,
    title: "Résiliation",
    content: (
      <>
        <ul>
          <li><strong>Mensuel :</strong> Résiliable à tout moment depuis la page Abonnement de votre compte. L&apos;accès reste actif jusqu&apos;à la fin du mois en cours.</li>
          <li><strong>Annuel :</strong> L&apos;engagement court sur l&apos;année scolaire (10 mois). La résiliation anticipée n&apos;est pas possible. L&apos;accès reste actif jusqu&apos;à la fin de la période.</li>
          <li><strong>Essai gratuit :</strong> Si vous ne souscrivez pas d&apos;abonnement à la fin de l&apos;essai, votre compte reste actif mais l&apos;accès aux fonctionnalités est suspendu.</li>
        </ul>
      </>
    ),
  },
  {
    num: "06",
    icon: RotateCcw,
    title: "Droit de rétractation",
    content: (
      <>
        <p>
          Conformément à la réglementation en vigueur, vous disposez d&apos;un délai de
          14 jours à compter de la souscription pour exercer votre droit de rétractation,
          sans avoir à justifier de motifs.
        </p>
        <p>
          Toutefois, en acceptant que l&apos;exécution du service commence immédiatement
          lors de la souscription, vous renoncez expressément à votre droit de rétractation.
        </p>
        <p>
          Pour exercer ce droit dans les cas éligibles, contactez-nous à{" "}
          <strong>contact@orgascol.fr</strong> avec votre demande et les informations de votre compte.
        </p>
      </>
    ),
  },
  {
    num: "07",
    icon: RefreshCw,
    title: "Remboursements",
    content: (
      <>
        <p>Les remboursements peuvent être accordés dans les cas suivants :</p>
        <ul>
          <li><strong>Problème technique majeur :</strong> Si un dysfonctionnement de notre plateforme vous empêche d&apos;utiliser le service pendant plus de 7 jours consécutifs.</li>
          <li><strong>Double facturation :</strong> En cas de facturation en double par erreur technique.</li>
          <li><strong>Fermeture de compte injustifiée :</strong> Si votre compte est fermé par erreur alors que vous n&apos;avez pas enfreint nos règles.</li>
        </ul>
        <p>
          Les demandes de remboursement doivent être adressées à <strong>contact@orgascol.fr</strong> dans
          un délai de 30 jours suivant l&apos;incident. Chaque demande est examinée au cas par cas.
        </p>
      </>
    ),
  },
  {
    num: "08",
    icon: Shield,
    title: "Responsabilités",
    content: (
      <>
        <p>
          Orga&apos;Scol s&apos;engage à fournir le service décrit avec diligence. Cependant, nous ne
          garantissons pas de résultats spécifiques (réussite aux examens, notes, etc.).
          Le planning généré est un outil d&apos;aide à l&apos;organisation.
        </p>
        <p>
          En cas de violation de nos règles, nous nous réservons le droit de suspendre ou
          résilier votre compte sans remboursement.
        </p>
        <p>
          Orga&apos;Scol ne saurait être tenu responsable des dommages indirects résultant de
          l&apos;utilisation de ses services.
        </p>
      </>
    ),
  },
  {
    num: "09",
    icon: FileText,
    title: "Modification des CGU",
    content: (
      <>
        <p>
          Orga&apos;Scol se réserve le droit de modifier les présentes CGU à tout moment.
          Les modifications entrent en vigueur dès leur publication sur le site.
        </p>
        <p>
          Les utilisateurs seront informés des modifications substantielles par email
          ou notification sur la plateforme.
        </p>
        <p>
          La poursuite de l&apos;utilisation du service après modification vaut acceptation
          des nouvelles CGU.
        </p>
      </>
    ),
  },
  {
    num: "10",
    icon: Scale,
    title: "Litiges et droit applicable",
    content: (
      <>
        <p>Les présentes CGU sont soumises au droit français.</p>
        <p>
          En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
        </p>
        <p>
          À défaut d&apos;accord amiable, les tribunaux compétents seront ceux du ressort
          du siège social de l&apos;éditeur.
        </p>
      </>
    ),
  },
];

export default function CGUPage() {
  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="text-center space-y-4 pb-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Conditions Générales d&apos;<span className="text-primary">Utilisation</span>
        </h1>
        <p className="text-muted max-w-lg mx-auto">
          Informations sur nos services, abonnements, paiements et conditions d&apos;utilisation.
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
        <h3 className="text-xl font-bold">Une question sur nos CGU ?</h3>
        <p className="text-white/70 text-sm max-w-md mx-auto">
          Notre équipe est disponible pour répondre à toutes vos questions.
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

      {/* Acceptance notice */}
      <p className="text-xs text-muted text-center leading-relaxed max-w-lg mx-auto">
        En utilisant Orga&apos;Scol, tu confirmes avoir lu et accepté ces conditions.
        Le non-respect de ces règles peut entraîner la suspension ou la suppression
        de ton compte sans préavis.
      </p>
    </div>
  );
}
