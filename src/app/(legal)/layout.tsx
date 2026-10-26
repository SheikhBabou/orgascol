import Link from "next/link";
import { GraduationCap, X } from "lucide-react";
import Footer from "@/components/footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Full-width navbar */}
      <header className="sticky top-0 z-50 bg-card-bg/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between font-[family-name:var(--font-playfair)]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">
              Orga&apos;Scol
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Accueil", href: "/" },
              { label: "Fonctionnalités", href: "/#fonctionnalités" },
              { label: "Méthode", href: "/#méthode" },
              { label: "Tarifs", href: "/#tarifs" },
              { label: "FAQ", href: "/faq" },
              { label: "Contact", href: "/contact" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="nav-link text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/auth?plan=mensuel"
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
            >
              Commencer
            </Link>
            <Link
              href="/"
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-background transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
