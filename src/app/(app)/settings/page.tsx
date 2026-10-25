"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Lock, Save, Loader2, Sun, Moon, Monitor } from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  useEffect(() => {
    loadUser();
    try {
      const saved = localStorage.getItem("theme") as "system" | "light" | "dark" | null;
      if (saved) setTheme(saved);
    } catch {}
  }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email ?? "");
    }
    setLoading(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Le mot de passe doit faire au moins 6 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMsg({ type: "error", text: error.message });
    } else {
      setPasswordMsg({ type: "success", text: "Mot de passe mis à jour !" });
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  }

  function changeTheme(newTheme: "system" | "light" | "dark") {
    setTheme(newTheme);
    try { localStorage.setItem("theme", newTheme); } catch {}
    if (newTheme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted text-sm mt-1">Gère ton compte et tes préférences</p>
      </div>

      <div className="bg-card-bg border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-light">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold">Compte</h2>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-muted mt-1">L&#39;email ne peut pas être modifié pour le moment.</p>
        </div>
      </div>

      <div className="bg-card-bg border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-light">
            <Sun className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold">Apparence</h2>
        </div>
        <div className="flex gap-3">
          {([
            { value: "system", label: "Système", icon: Monitor },
            { value: "light", label: "Clair", icon: Sun },
            { value: "dark", label: "Sombre", icon: Moon },
          ] as const).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => changeTheme(value)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
                theme === value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-background"
              }`}
            >
              <Icon className={`w-5 h-5 ${theme === value ? "text-primary" : "text-muted"}`} />
              <span className={`text-sm font-medium ${theme === value ? "text-primary" : ""}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="bg-card-bg border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-light">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold">Changer le mot de passe</h2>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="6 caractères minimum"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Retape le mot de passe"
          />
        </div>

        {passwordMsg && (
          <p className={`text-sm px-3 py-2 rounded-lg ${
            passwordMsg.type === "success"
              ? "text-success bg-success/10"
              : "text-danger bg-danger/10"
          }`}>
            {passwordMsg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={passwordSaving}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
        >
          {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {passwordSaving ? "Enregistrement..." : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
}
