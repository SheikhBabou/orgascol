"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardList,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Layers,
  Calculator,
  Settings,
  CreditCard,
  ChevronDown,
  User,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/confirm-dialog";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Matières", href: "/subjects", icon: Layers },
  { name: "Examens & Projets", href: "/exams", icon: BookOpen },
  { name: "Emploi du temps", href: "/schedule", icon: Calendar },
  { name: "Planning de révision", href: "/planning", icon: ClipboardList },
  { name: "Notes & Moyennes", href: "/grades", icon: Calculator },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userFormation, setUserFormation] = useState("");
  const [userFormationName, setUserFormationName] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const meta = user.user_metadata;
        const first = meta?.first_name || "";
        const last = meta?.last_name || "";
        setUserName(first && last ? `${first} ${last}` : first || last || "");
        setUserEmail(user.email ?? "");
        setUserFormation(meta?.formation || "");
        setUserFormationName(meta?.formation_name || "");
      }
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileDropdown]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  const navContent = (
    <>
      <div className="flex items-center justify-between px-4 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">Orga&apos;Scol</span>
        </div>
        {(userName || userEmail) && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${showProfileDropdown ? "rotate-180" : ""}`} />
            </button>
            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-card-bg border border-border rounded-xl shadow-lg z-50 animate-fade-in overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      {userName && <p className="text-sm font-semibold truncate">{userName}</p>}
                      <p className="text-xs text-muted truncate">{userEmail}</p>
                    </div>
                  </div>
                  {(userFormation || userFormationName) && (
                    <div className="flex flex-wrap gap-1.5">
                      {userFormation && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {userFormation}
                        </span>
                      )}
                      {userFormationName && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-muted">
                          {userFormationName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <Link
                    href="/settings"
                    onClick={() => { setShowProfileDropdown(false); setMobileOpen(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-primary-light/50 hover:text-foreground transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mon profil
                  </Link>
                  <button
                    onClick={() => { setShowProfileDropdown(false); setShowLogoutConfirm(true); }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-danger/10 hover:text-danger transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-muted hover:bg-primary-light/50 hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-1">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname.startsWith("/settings")
              ? "bg-primary-light text-primary"
              : "text-muted hover:bg-primary-light/50 hover:text-foreground"
          }`}
        >
          <Settings className="w-5 h-5" />
          Paramètres
        </Link>
        <Link
          href="/subscription"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname.startsWith("/subscription")
              ? "bg-primary-light text-primary"
              : "text-muted hover:bg-primary-light/50 hover:text-foreground"
          }`}
        >
          <CreditCard className="w-5 h-5" />
          Abonnement
        </Link>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-danger/10 hover:text-danger transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card-bg border border-border md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg border-r border-border flex flex-col transform transition-transform md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1"
        >
          <X className="w-5 h-5" />
        </button>
        {navContent}
      </aside>

      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar-bg border-r border-border">
        {navContent}
      </aside>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Se déconnecter ?"
        message="Tu seras redirigé vers la page de connexion."
        confirmLabel="Déconnexion"
        onConfirm={() => { setShowLogoutConfirm(false); handleLogout(); }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
