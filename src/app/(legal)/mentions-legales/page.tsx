import {
  Info,
  User,
  Server,
  Copyright,
  Cookie,
  Link2,
  Mail,
} from "lucide-react";

const sections = [
  {
    num: "01",
    icon: User,
    title: "Éditeur du site",
    content: (
      <>
        <ul>
          <li><strong>Nom du service :</strong> Orga&apos;Scol</li>
          <li><strong>Responsable de la publication :</strong> Cheikh Babou</li>
          <li><strong>Email :</strong> contact@orgascol.fr</li>
          <li><strong>Statut :</strong> Micro-entreprise en création</li>
          <li><strong>Pays :</strong> France</li>
        </ul>
      </>
    ),
  },
  {
    num: "02",
    icon: Server,
    title: "Hébergement",
    content: (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-background border border-border">
            <p className="font-semibold text-sm text-foreground">Vercel Inc.</p>
            <p className="text-xs text-muted mt-1">Hébergement de l&apos;application</p>
            <p className="text-xs text-muted">340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border">
            <p className="font-semibold text-sm text-foreground">Supabase Inc.</p>
            <p className="text-xs text-muted mt-1">Base de données &amp; authentification</p>
            <p className="text-xs text-muted">970 Toa Payoh North #07-04, Singapore</p>
          </div>
        </div>
      </>
    ),
  },
  {
    num: "03",
    icon: Copyright,
    title: "Propriété intellectuelle",
    content: (
      <>
        <p>
          L&apos;ensemble du contenu du site Orga&apos;Scol (textes, interface, logos, graphismes,
          icônes, code source) est la propriété exclusive de l&apos;éditeur, sauf mention contraire.
        </p>
        <p>
          Toute reproduction, représentation, modification ou adaptation, totale ou partielle,
          est interdite sans autorisation préalable écrite de l&apos;éditeur.
        </p>
        <p>
          Les données saisies par l&apos;utilisateur (matières, notes, examens, etc.) restent
          la propriété de l&apos;utilisateur.
        </p>
      </>
    ),
  },
  {
    num: "04",
    icon: Cookie,
    title: "Cookies",
    content: (
      <>
        <p>
          Orga&apos;Scol utilise uniquement des <strong>cookies techniques strictement nécessaires</strong> au
          fonctionnement du service :
        </p>
        <ul>
          <li><strong>Authentification :</strong> Maintien de votre session de connexion.</li>
          <li><strong>Préférences :</strong> Sauvegarde du thème (clair/sombre) dans le stockage local du navigateur.</li>
        </ul>
        <p>
          <strong>Aucun cookie publicitaire, analytique ou de traçage</strong> n&apos;est utilisé.
          Aucun consentement supplémentaire n&apos;est requis pour les cookies strictement nécessaires
          (conformément à la directive ePrivacy).
        </p>
      </>
    ),
  },
  {
    num: "05",
    icon: Link2,
    title: "Liens et données personnelles",
    content: (
      <>
        <p>
          Les informations relatives au traitement de vos données personnelles sont détaillées
          dans notre <a href="/confidentialite" className="text-primary font-medium hover:underline">Politique de confidentialité</a>.
        </p>
        <p>
          Les conditions d&apos;utilisation du service et des abonnements sont détaillées
          dans nos <a href="/cgu" className="text-primary font-medium hover:underline">Conditions Générales d&apos;Utilisation</a>.
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
          Informations légales relatives au site Orga&apos;Scol et à son éditeur.
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
          href="mailto:contact@orgascol.fr"
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
