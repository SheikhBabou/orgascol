"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  Calendar,
  Brain,
  Bell,
  ArrowRight,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Check,
  Crown,
  Menu,
  X,
} from "lucide-react";
import Footer from "@/components/footer";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState<string>("#");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar — full-width, morphs on scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-card-bg/80 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
        style={{ transitionTimingFunction: "var(--ease-magnetic)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between font-[family-name:var(--font-playfair)]">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2 cursor-pointer shrink-0"
          >
            <GraduationCap className={`w-6 h-6 transition-colors duration-300 ${scrolled ? "text-primary" : "text-white"}`} />
            <span className={`text-lg font-bold transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white"}`}>
              Orga&apos;Scol
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Accueil", href: "#" },
              { label: "Fonctionnalités", href: "#fonctionnalités" },
              { label: "Méthode", href: "#méthode" },
              { label: "Tarifs", href: "#tarifs" },
              { label: "FAQ", href: "/faq" },
              { label: "Contact", href: "/contact" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setActiveNav(href)}
                className={`nav-link text-sm font-medium transition-colors duration-300 ${
                  activeNav === href ? "active" : ""
                } ${
                  scrolled ? "text-muted hover:text-foreground" : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/auth?plan=mensuel"
              className={`hidden sm:inline-flex shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 btn-magnetic ${
                scrolled
                  ? "bg-primary text-white"
                  : "bg-white/15 text-white backdrop-blur-sm border border-white/20 hover:bg-white/25"
              }`}
            >
              Commencer
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                scrolled ? "text-foreground hover:bg-background" : "text-white hover:bg-white/15"
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t px-6 py-4 space-y-1 font-[family-name:var(--font-playfair)] ${
            scrolled
              ? "bg-card-bg/95 backdrop-blur-xl border-border"
              : "bg-foreground/95 backdrop-blur-xl border-white/10"
          }`}>
            {[
              { label: "Accueil", href: "#" },
              { label: "Fonctionnalités", href: "#fonctionnalités" },
              { label: "Méthode", href: "#méthode" },
              { label: "Tarifs", href: "#tarifs" },
              { label: "FAQ", href: "/faq" },
              { label: "Contact", href: "/contact" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => { setActiveNav(href); setMobileMenuOpen(false); }}
                className={`block py-2.5 text-sm font-medium transition-colors ${
                  activeNav === href ? "text-primary" : scrolled ? "text-muted" : "text-white/70"
                }`}
              >
                {label}
              </a>
            ))}
            <Link
              href="/auth?plan=mensuel"
              className="block w-full text-center py-3 mt-2 bg-primary text-white rounded-full text-sm font-semibold"
            >
              Commencer
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 hero-gradient" />
        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24 pt-40 md:pb-32">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm animate-hero-text">
              <Sparkles className="w-4 h-4" />
              1 mois d&apos;essai gratuit — sans engagement
            </div>
            <h1 className="animate-hero-text" style={{ animationDelay: "0.15s" }}>
              <span className="block text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                Planifie tes révisions,
              </span>
              <span className="block text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mt-2"
                style={{ color: "#c4b5fd" }}>
                réussis tes examens.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed animate-hero-text" style={{ animationDelay: "0.3s" }}>
              Renseigne tes examens et ton emploi du temps. Orga&apos;Scol génère
              un planning de révision optimal basé sur la répétition espacée.
              Essaie gratuitement pendant 1 mois.
            </p>
            <div className="flex flex-wrap gap-4 animate-hero-text" style={{ animationDelay: "0.45s" }}>
              <Link
                href="/auth?plan=mensuel"
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 rounded-2xl font-semibold text-base btn-magnetic hover:shadow-[0_8px_30px_-5px_rgba(255,255,255,0.3)]"
              >
                Essayer gratuitement
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#fonctionnalités"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white border border-white/15 rounded-2xl font-semibold text-base backdrop-blur-sm hover:bg-white/15 transition-all duration-300"
              >
                Découvrir
              </a>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 mt-16 animate-hero-text" style={{ animationDelay: "0.6s" }}>
            {[
              { value: "1 mois", label: "Essai gratuit" },
              { value: "4", label: "Méthodes de révision" },
              { value: "∞", label: "Examens & matières" },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl font-bold text-white">{value}</span>
                <span className="text-sm text-white/50">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalités" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 stagger-children">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Fonctionnalités
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Tout ce qu&apos;il te faut pour{" "}
              <span className="text-primary">cartonner</span>
            </h2>
            <p className="text-muted mt-4">
              Un outil complet qui t&apos;accompagne de la saisie de tes cours
              jusqu&apos;au jour de l&apos;examen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: Calendar,
                title: "Planning automatique",
                desc: "Un planning de révision généré selon tes dispos et la date de chaque examen. Répétition espacée intégrée.",
                color: "from-indigo-500 to-purple-500",
              },
              {
                icon: Brain,
                title: "Méthodes scientifiques",
                desc: "1re lecture, révision active, répétition espacée, relecture finale — des techniques prouvées.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Bell,
                title: "Alertes intelligentes",
                desc: "Dashboard avec alertes J-5 pour tes examens et projets. Tu ne rates plus jamais une échéance.",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: BookOpen,
                title: "Gestion des examens",
                desc: "Ajoute tes examens, leurs chapitres, et suis ta progression de révision chapitre par chapitre.",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: BarChart3,
                title: "Notes & moyennes",
                desc: "Calcul automatique des moyennes par matière, par UE, et générale pondérée par ECTS.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: CheckCircle2,
                title: "Import emploi du temps",
                desc: "Importe ton emploi du temps depuis un lien iCal en un clic. Fini la saisie manuelle.",
                color: "from-rose-500 to-red-500",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group bg-card-bg border border-border rounded-2xl p-6 space-y-4 card-interactive"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Method / Philosophy */}
      <section id="méthode" className="py-16 px-6 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center space-y-8 stagger-children">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-semibold uppercase tracking-wider">
            Notre approche
          </span>
          <div className="space-y-4">
            <p className="text-lg md:text-xl text-white/50">
              La plupart des étudiants révisent en mode panique la veille de l&apos;examen.
            </p>
            <p className="text-3xl md:text-5xl font-bold leading-tight font-[family-name:var(--font-playfair)]">
              Nous planifions{" "}
              <span className="text-primary italic">chaque session</span>
              {" "}en avance pour que ta mémoire travaille pour toi.
            </p>
          </div>
          <p className="text-base text-white/40 max-w-2xl mx-auto">
            La répétition espacée est la méthode la plus efficace pour retenir
            l&apos;information à long terme. Orga&apos;Scol l&apos;applique automatiquement
            à ton planning en fonction de tes disponibilités réelles.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 stagger-children">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Comment ça marche
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              3 étapes, <span className="text-primary">0 prise de tête</span>
            </h2>
          </div>

          <div className="space-y-6 stagger-children">
            {[
              {
                step: "01",
                title: "Ajoute tes examens et matières",
                desc: "Renseigne la date de chaque examen, les chapitres à réviser, et tes créneaux de cours.",
              },
              {
                step: "02",
                title: "Génère ton planning",
                desc: "Un clic et Orga'Scol planifie tes sessions de révision sur tes créneaux libres, avec les bonnes méthodes au bon moment.",
              },
              {
                step: "03",
                title: "Révise et valide",
                desc: "Coche tes sessions au fur et à mesure. Suis ta progression sur le dashboard et arrive serein le jour J.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex items-start gap-6 bg-card-bg border border-border rounded-2xl p-6 card-interactive"
              >
                <span className="text-4xl font-bold text-primary/20 font-mono shrink-0">
                  {step}
                </span>
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-muted mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 stagger-children">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Tarifs
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Un prix simple,{" "}
              <span className="text-primary">tout inclus</span>
            </h2>
            <p className="text-muted mt-4">
              1 mois d&apos;essai gratuit. Le paiement commence 30 jours apr&egrave;s ton inscription.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto stagger-children">
            {/* Monthly */}
            <div className="bg-card-bg border border-border rounded-2xl p-8 space-y-6 card-interactive">
              <div>
                <h3 className="text-lg font-semibold">Mensuel</h3>
                <p className="text-sm text-muted mt-1">Flexible, résiliable à tout moment</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">11,99€</span>
                <span className="text-muted">/mois</span>
              </div>
              <ul className="space-y-3">
                {[
                  "1 mois d'essai gratuit",
                  "Toutes les fonctionnalités",
                  "Planning de révision illimité",
                  "Import emploi du temps iCal",
                  "Notes & moyennes par UE",
                  "Résiliable à tout moment",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth?plan=mensuel"
                className="group flex items-center justify-center gap-2 w-full py-3 border border-border rounded-xl font-semibold text-sm hover:bg-background transition-colors btn-press"
              >
                Commencer l&apos;essai gratuit
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Annual */}
            <div className="relative bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-8 space-y-6 text-white card-interactive overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold">
                <Crown className="w-3.5 h-3.5" />
                Économise 17%
              </div>
              <div className="relative">
                <h3 className="text-lg font-semibold">Annuel</h3>
                <p className="text-sm text-white/60 mt-1">Engagement année scolaire (10 mois), meilleur prix</p>
              </div>
              <div className="relative flex items-baseline gap-1">
                <span className="text-4xl font-bold">9,99€</span>
                <span className="text-white/60">/mois</span>
              </div>
              <p className="text-xs text-white/40 -mt-3">Soit 99,90€ l&apos;année scolaire — paiement mensuel ou en une fois</p>
              <ul className="relative space-y-3">
                {[
                  "1 mois d'essai gratuit",
                  "Toutes les fonctionnalités",
                  "Planning de révision illimité",
                  "Import emploi du temps iCal",
                  "Notes & moyennes par UE",
                  "2 mois économisés vs mensuel",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-white/80 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth?plan=annuel"
                className="group relative flex items-center justify-center gap-2 w-full py-3 bg-white text-indigo-700 rounded-xl font-semibold text-sm btn-magnetic hover:shadow-[0_8px_30px_-5px_rgba(255,255,255,0.3)]"
              >
                Commencer l&apos;essai gratuit
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-muted mt-8">
            Essai gratuit de 30 jours. Aucun paiement requis pendant la p&eacute;riode d&apos;essai.
            L&apos;abonnement annuel n&apos;est pas résiliable avant la fin de l&apos;année scolaire.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center stagger-children">
          <div className="bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Prêt à organiser tes révisions ?
              </h2>
              <p className="text-white/70 text-lg max-w-xl mx-auto">
                Essaie Orga&apos;Scol gratuitement pendant 1 mois.
                Aucune carte bancaire demandée à l&apos;inscription.
              </p>
              <Link
                href="/auth?plan=mensuel"
                className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-indigo-700 rounded-2xl font-bold text-lg btn-magnetic hover:shadow-[0_8px_30px_-5px_rgba(255,255,255,0.4)]"
              >
                Commencer mon essai gratuit
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
