"use client";

import { useState } from "react";
import {
  Mail,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const SUBJECTS = [
  "Question générale",
  "Problème technique",
  "Abonnement & paiement",
  "Demande de remboursement",
  "Suppression de compte",
  "Suggestion d'amélioration",
  "Autre",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Placeholder — will integrate with email service later
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 pb-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Contactez-<span className="text-primary">nous</span>
        </h1>
        <p className="text-muted max-w-lg mx-auto">
          Une question ? Une suggestion ? Notre équipe est là pour vous aider.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Contact info — left */}
        <div className="md:col-span-2 space-y-5">
          <h2 className="font-bold text-lg">Nos coordonnées</h2>

          <div className="bg-card-bg border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium">Email</p>
              <p className="text-sm font-semibold">contact@orgascol.fr</p>
            </div>
          </div>

          <div className="bg-card-bg border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium">Délai de réponse</p>
              <p className="text-sm font-semibold">Sous 24-48h ouvrées</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted">
            <p>
              Consulte nos <a href="/cgu" className="text-primary font-medium hover:underline">CGU</a> et
              notre <a href="/confidentialite" className="text-primary font-medium hover:underline">Politique de confidentialité</a> pour
              trouver rapidement des réponses aux questions fréquentes.
            </p>
          </div>
        </div>

        {/* Form — right */}
        <div className="md:col-span-3">
          {sent ? (
            <div className="bg-card-bg border border-border rounded-2xl p-10 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold">Message envoyé !</h3>
              <p className="text-sm text-muted max-w-sm mx-auto">
                Merci pour ton message. Nous te répondrons dans les 24-48h ouvrées
                à l&apos;adresse <strong>{email}</strong>.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setName("");
                  setEmail("");
                  setSubject("");
                  setMessage("");
                }}
                className="text-sm text-primary font-medium hover:underline"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-card-bg border border-border rounded-2xl p-6 md:p-8 space-y-5"
            >
              <h2 className="font-bold text-lg">Envoyez-nous un message</h2>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Votre nom <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Prénom et nom"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Votre email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Sujet <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none"
                >
                  <option value="">Sélectionnez un sujet</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Votre message <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre demande en détail..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 btn-magnetic"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? "Envoi en cours..." : "Envoyer le message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
