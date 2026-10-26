export default function ConfidentialitePage() {
  return (
    <div className="prose-custom space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Politique de confidentialit&eacute;</h1>
        <p className="text-muted text-sm mt-2">Derni&egrave;re mise &agrave; jour : 26 octobre 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Introduction</h2>
        <p className="text-sm text-muted leading-relaxed">
          Orga&apos;Scol s&apos;engage &agrave; prot&eacute;ger la vie priv&eacute;e de ses utilisateurs. Cette politique
          d&eacute;crit les donn&eacute;es que nous collectons, pourquoi nous les collectons et comment nous
          les utilisons, conform&eacute;ment au R&egrave;glement G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es (RGPD).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Donn&eacute;es collect&eacute;es</h2>
        <div className="bg-card-bg border border-border rounded-xl p-5 text-sm space-y-3">
          <div>
            <p className="font-medium">Donn&eacute;es de compte</p>
            <p className="text-muted mt-0.5">Adresse email et mot de passe (chiffr&eacute;) lors de l&apos;inscription.</p>
          </div>
          <div>
            <p className="font-medium">Donn&eacute;es d&apos;utilisation</p>
            <p className="text-muted mt-0.5">Mati&egrave;res, examens, chapitres, notes, projets, emploi du temps et sessions de r&eacute;vision que vous saisissez.</p>
          </div>
          <div>
            <p className="font-medium">Donn&eacute;es techniques</p>
            <p className="text-muted mt-0.5">Pr&eacute;f&eacute;rences d&apos;affichage (th&egrave;me clair/sombre) stock&eacute;es localement dans votre navigateur.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Finalit&eacute;s du traitement</h2>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Fournir et am&eacute;liorer le service de planification de r&eacute;visions
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            G&eacute;rer votre compte et votre abonnement
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Vous envoyer des notifications li&eacute;es au service (rappels d&apos;examens)
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Assurer la s&eacute;curit&eacute; et le bon fonctionnement de la plateforme
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Base l&eacute;gale</h2>
        <p className="text-sm text-muted leading-relaxed">
          Le traitement de vos donn&eacute;es repose sur l&apos;ex&eacute;cution du contrat (fourniture du service)
          et votre consentement lors de l&apos;inscription.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Sous-traitants</h2>
        <div className="bg-card-bg border border-border rounded-xl p-5 text-sm space-y-3">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Supabase</p>
              <p className="text-muted mt-0.5">Base de donn&eacute;es et authentification</p>
            </div>
            <span className="text-xs text-muted px-2.5 py-1 bg-background rounded-lg h-fit">UE / US</span>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Vercel</p>
              <p className="text-muted mt-0.5">H&eacute;bergement de l&apos;application</p>
            </div>
            <span className="text-xs text-muted px-2.5 py-1 bg-background rounded-lg h-fit">US</span>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Stripe</p>
              <p className="text-muted mt-0.5">Traitement des paiements</p>
            </div>
            <span className="text-xs text-muted px-2.5 py-1 bg-background rounded-lg h-fit">US</span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Dur&eacute;e de conservation</h2>
        <p className="text-sm text-muted leading-relaxed">
          Vos donn&eacute;es sont conserv&eacute;es tant que votre compte est actif. En cas de suppression
          de compte, vos donn&eacute;es sont supprim&eacute;es dans un d&eacute;lai de 30 jours.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Vos droits</h2>
        <p className="text-sm text-muted leading-relaxed">
          Conform&eacute;ment au RGPD, vous disposez des droits suivants :
        </p>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <strong>Acc&egrave;s :</strong> obtenir une copie de vos donn&eacute;es personnelles
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <strong>Rectification :</strong> corriger vos donn&eacute;es inexactes
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <strong>Suppression :</strong> demander l&apos;effacement de vos donn&eacute;es
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <strong>Portabilit&eacute; :</strong> r&eacute;cup&eacute;rer vos donn&eacute;es dans un format structur&eacute;
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <strong>Opposition :</strong> vous opposer au traitement de vos donn&eacute;es
          </li>
        </ul>
        <p className="text-sm text-muted leading-relaxed">
          Pour exercer ces droits, contactez-nous &agrave; : <strong>contact@orgascol.fr</strong>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">S&eacute;curit&eacute;</h2>
        <p className="text-sm text-muted leading-relaxed">
          Nous mettons en &oelig;uvre des mesures de s&eacute;curit&eacute; techniques et organisationnelles
          pour prot&eacute;ger vos donn&eacute;es : chiffrement des mots de passe, connexions HTTPS,
          authentification s&eacute;curis&eacute;e via Supabase Auth, isolation des donn&eacute;es par utilisateur
          (Row Level Security).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-sm text-muted leading-relaxed">
          Pour toute question relative &agrave; cette politique, contactez-nous &agrave; :
          <strong> contact@orgascol.fr</strong>
        </p>
      </section>
    </div>
  );
}
