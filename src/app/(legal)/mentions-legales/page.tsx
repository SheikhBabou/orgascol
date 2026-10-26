export default function MentionsLegalesPage() {
  return (
    <div className="prose-custom space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mentions l&eacute;gales</h1>
        <p className="text-muted text-sm mt-2">Derni&egrave;re mise &agrave; jour : 26 octobre 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">&Eacute;diteur du site</h2>
        <div className="bg-card-bg border border-border rounded-xl p-5 text-sm space-y-1.5">
          <p><strong>Nom du service :</strong> Orga&apos;Scol</p>
          <p><strong>Statut :</strong> Projet en cours de d&eacute;veloppement (micro-entreprise en cr&eacute;ation)</p>
          <p><strong>Responsable de la publication :</strong> Cheikh Babou</p>
          <p><strong>Email :</strong> contact@orgascol.fr</p>
          <p><strong>Adresse :</strong> France</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">H&eacute;bergement</h2>
        <div className="bg-card-bg border border-border rounded-xl p-5 text-sm space-y-1.5">
          <p><strong>H&eacute;bergeur :</strong> Vercel Inc.</p>
          <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, &Eacute;tats-Unis</p>
          <p><strong>Site :</strong> vercel.com</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-5 text-sm space-y-1.5">
          <p><strong>Base de donn&eacute;es :</strong> Supabase Inc.</p>
          <p><strong>Adresse :</strong> 970 Toa Payoh North #07-04, Singapore 318992</p>
          <p><strong>Site :</strong> supabase.com</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Propri&eacute;t&eacute; intellectuelle</h2>
        <p className="text-sm text-muted leading-relaxed">
          L&apos;ensemble du contenu du site Orga&apos;Scol (textes, interface, logos, graphismes, ic&ocirc;nes)
          est la propri&eacute;t&eacute; exclusive de l&apos;&eacute;diteur, sauf mention contraire. Toute reproduction,
          repr&eacute;sentation, modification ou adaptation, totale ou partielle, est interdite sans
          autorisation pr&eacute;alable &eacute;crite de l&apos;&eacute;diteur.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Donn&eacute;es personnelles</h2>
        <p className="text-sm text-muted leading-relaxed">
          Les informations relatives au traitement de vos donn&eacute;es personnelles sont d&eacute;taill&eacute;es
          dans notre <a href="/confidentialite" className="text-primary hover:underline">Politique de confidentialit&eacute;</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cookies</h2>
        <p className="text-sm text-muted leading-relaxed">
          Orga&apos;Scol utilise uniquement des cookies techniques strictement n&eacute;cessaires au
          fonctionnement du service (authentification, pr&eacute;f&eacute;rences de th&egrave;me). Aucun cookie
          publicitaire ou de tra&ccedil;age n&apos;est utilis&eacute;.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-sm text-muted leading-relaxed">
          Pour toute question concernant ces mentions l&eacute;gales, vous pouvez nous contacter
          &agrave; l&apos;adresse : <strong>contact@orgascol.fr</strong>
        </p>
      </section>
    </div>
  );
}
