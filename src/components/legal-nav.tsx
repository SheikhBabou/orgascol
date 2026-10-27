"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Fonctionnalités", href: "/#fonctionnalités" },
  { label: "Méthode", href: "/#méthode" },
  { label: "Tarifs", href: "/#tarifs" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function LegalNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-8">
        {LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className={`nav-link text-sm font-medium text-muted hover:text-foreground transition-colors ${
              pathname === href ? "active" : ""
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-background transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card-bg/95 backdrop-blur-xl border-t border-border px-6 py-4 space-y-1 font-[family-name:var(--font-playfair)]">
          {LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 text-sm font-medium transition-colors ${
                pathname === href ? "text-primary" : "text-muted"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/auth?plan=mensuel"
            onClick={() => setOpen(false)}
            className="block w-full text-center py-3 mt-2 bg-primary text-white rounded-full text-sm font-semibold"
          >
            Commencer
          </Link>
        </div>
      )}
    </>
  );
}
