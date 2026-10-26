import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import HideInEmbed from "@/components/hide-in-embed";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <HideInEmbed>
        <header className="sticky top-0 z-50 bg-card-bg/70 backdrop-blur-xl border-b border-border">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">Orga&apos;Scol</span>
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </div>
        </header>
      </HideInEmbed>
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        {children}
      </main>
      <HideInEmbed>
        <footer className="border-t border-border py-8 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Orga&apos;Scol. Tous droits r&eacute;serv&eacute;s.
        </footer>
      </HideInEmbed>
    </div>
  );
}
