"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
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
  );
}
