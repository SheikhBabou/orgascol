import Link from "next/link";
import { GraduationCap, X } from "lucide-react";
import Footer from "@/components/footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar — same style as landing hero */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-6 bg-primary/90 backdrop-blur-xl border border-white/10 shadow-lg">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-white" />
          <span className="text-lg font-bold text-white">
            Orga&apos;Scol
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          {["Fonctionnalités", "Méthode", "Tarifs"].map((item) => (
            <Link
              key={item}
              href={`/#${item.toLowerCase()}`}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>
        <Link
          href="/auth?plan=mensuel"
          className="ml-2 px-5 py-2 rounded-xl text-sm font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-all"
        >
          Commencer
        </Link>
        <Link
          href="/"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </Link>
      </header>

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
