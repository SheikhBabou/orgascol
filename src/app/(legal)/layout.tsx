import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import Footer from "@/components/footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
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
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
