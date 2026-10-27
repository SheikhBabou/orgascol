import {
  Info,
  User,
  Server,
  Copyright,
  Shield,
  FileText,
  Scale,
  Mail,
} from "lucide-react";

const sections = [
  {
    num: "01",
    icon: User,
    title: "Éditeur du site",
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Nom du service", value: "Orga'Scol" },
          { label: "Statut", value: "Micro-entreprise" },
          { label: "Pays", value: "France" },
          { label: "Email de contact", value: "contact@orgascol.fr" },
        ].map(({ label, value }) => (
          <div key={label} className="p-4 rounded-xl bg-background border border-border">
            <p className="text-xs text-muted font-medium">{label}</p>
            <p className="font-semibold text-sm text-foreground mt-1">{value}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: "02",
    icon: Server,
    title: "Hébergement",
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-background border border-border">
          <p className="font-semibold text-sm text-foreground">Vercel Inc.</p>
          <p className="text-xs text-muted mt-1">Hébergement de l&apos;application</p>
          <p className="text-xs text-muted">340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
          <a href="https://vercel.com" className="text-xs text-primary font-medium hover:underline mt-1 inline-block">vercel.com</a>
        </div>
        <div className="p-4 rounded-xl bg-background border border-border">
          <p className="font-semibold text-sm text-foreground">Supabase Inc.</p>
          <p className="text-xs text-muted mt-1">Base de données &amp; authentification</p>
          <p className="text-xs text-muted">970 Toa Payoh North #07-04, Singapore</p>
          <a href="https://supabase.com" className="text-xs text-primary font-medium hover:underline mt-1 inline-block">supabase.com</a>
        </div>
        <div className="p-4 rounded-xl bg-background border border-border">
          <p className="font-semibold text-sm text-foreground">Stripe Inc.</p>
          <p className="text-xs text-muted mt-1">Traitement sécurisé des paiements</p>
          <p className="text-xs text-muted">354 Oyster Point Blvd, South San Francisco, CA 94080, USA</p>
          <a href="https://stripe.com" className="text-xs text-primary font-medium hover:underline mt-1 inline-block">stripe.com</a>
        </div>
      </div>
    ),
  },
  {
    num: "03",
    icon: Copyright,
    title: "Propriété intellectuelle",
    content: (
      <>
        <p>
          L&apos;ensemble du contenu du site Orga&apos;Scol (textes, interface, logos,
          graphismes, icônes, code source) est protégé par le droit d&apos;auteur.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou
          adaptation de tout ou partie des éléments du site est interdite sans
          autorisation écrite préalable.
        </p>
        <p>
          Les données saisies par l&apos;utilisateur (matières, notes, examens, etc.)
          restent la propriété de l&apos;utilisateur.
        </p>
      </>
    ),
  },
  {
    num: "04",
    icon: Shield,
    title: "Protection des données",
    content: (
      <>
        <p>
          Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification,
          de suppression et de portabilité de tes données personnelles.
        </p>
        <p>
          Pour plus de détails sur la collecte et le traitement de tes données,
          consulte notre Politique de confidentialité.
        </p>
        <a
          href="/confidentialite"
          className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-colors"
        >
          Voir la politique de confidentialité
        </a>
      </>
    ),
  },
  {
    num: "05",
    icon: FileText,
    title: "Conditions d'utilisation",
    content: (
      <>
        <p>
          En utilisant Orga&apos;Scol, tu acceptes nos Conditions Générales d&apos;Utilisation
          qui détaillent les abonnements, tarifs, résiliation et remboursements.
        </p>
        <a
          href="/cgu"
          className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-colors"
        >
          Voir les CGU complètes
        </a>
      </>
    ),
  },
  {
    num: "06",
    icon: Scale,
    title: "Droit applicable et litiges",
    content: (
      <>
        <p>Les présentes mentions légales sont régies par le droit français.</p>
        <p>
          En cas de litige, et après tentative de résolution amiable, les
          tribunaux compétents seront ceux du ressort du siège social de
          l&apos;éditeur.
        </p>
        <p>
          Pour toute réclamation, contacte-nous à : <strong>contact@orgascol.fr</strong>
        </p>
      </>
    ),
  },
];

export default function MentionsLegalesPage() {
  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="text-center space-y-4 pb-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Info className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Mentions <span className="text-primary">légales</span>
        </h1>
        <p className="text-muted max-w-lg mx-auto">
          Informations légales concernant le site Orga&apos;Scol, conformément aux obligations réglementaires.
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
        <h3 className="text-xl font-bold">Une question ?</h3>
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
    </div>
  );
}
