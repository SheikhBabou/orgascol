"use client";

import Link from "next/link";
import {
  ChevronDown,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/confirm-dialog";

export default function Topbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userFormation, setUserFormation] = useState("");
  const [userFormationName, setUserFormationName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  if (!userName && !userEmail) return null;

  return (
    <>
      <div className="hidden md:flex items-center justify-end px-6 py-3 border-b border-border bg-card-bg/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-background transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
              {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{userName || userEmail.split("@")[0]}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-card-bg border border-border rounded-xl shadow-lg z-50 animate-fade-in overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
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
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {userFormation}
                      </span>
                    )}
                    {userFormationName && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-background border border-border text-muted">
                        {userFormationName}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="p-2">
                <Link
                  href="/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-primary-light/50 hover:text-foreground transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-primary-light/50 hover:text-foreground transition-colors"
                >
                  <User className="w-4 h-4" />
                  Mon profil
                </Link>
                <button
                  onClick={() => { setShowDropdown(false); setShowLogoutConfirm(true); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-danger/10 hover:text-danger transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
