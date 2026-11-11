import Link from "next/link";
import { GraduationCap, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md space-y-6">
        <GraduationCap className="w-16 h-16 text-primary mx-auto opacity-50" />
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-xl font-semibold">Page introuvable</h2>
          <p className="text-muted text-sm">
            Oups ! La page que tu cherches n&apos;existe pas ou a été déplacée.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-background transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
