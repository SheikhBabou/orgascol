"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Palette, Layers } from "lucide-react";
import type { Subject } from "@/types/database";
import ConfirmDialog from "@/components/confirm-dialog";
import EmptyState from "@/components/empty-state";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ef4444", "#14b8a6", "#f97316", "#06b6d4",
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNames, setNewNames] = useState("");
  const [ueName, setUeName] = useState("");
  const [ects, setEcts] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .order("name");
    if (data) setSubjects(data);
    setLoading(false);
  }

  async function handleAddMultiple(e: React.FormEvent) {
    e.preventDefault();
    if (!newNames.trim()) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const names = newNames
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    const existingNames = subjects.map((s) => s.name.toLowerCase());
    const toAdd = names.filter(
      (n) => !existingNames.includes(n.toLowerCase())
    );

    if (toAdd.length > 0) {
      await supabase.from("subjects").insert(
        toAdd.map((name, i) => ({
          name,
          color: COLORS[(subjects.length + i) % COLORS.length],
          user_id: user.id,
          ue_name: ueName.trim() || null,
          ects: ects ? parseInt(ects) : 0,
        }))
      );
    }

    setNewNames("");
    setUeName("");
    setEcts("");
    setSaving(false);
    loadSubjects();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await supabase.from("subjects").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    loadSubjects();
  }

  async function updateColor(id: string, color: string) {
    await supabase.from("subjects").update({ color }).eq("id", id);
    loadSubjects();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Matières</h1>
        <p className="text-muted text-sm mt-1">
          Ajoute toutes tes matières ici. Elles seront disponibles partout
          dans l&apos;app.
        </p>
      </div>

      {/* Add form */}
      <form
        onSubmit={handleAddMultiple}
        className="bg-card-bg border border-border rounded-xl p-6 space-y-4"
      >
        <h2 className="font-semibold">Ajouter des matières</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">
              Une matière par ligne (tu peux en coller plusieurs d&apos;un coup)
            </label>
            <textarea
              value={newNames}
              onChange={(e) => setNewNames(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder={"Séries temporelles\nIntelligence Artificielle\nTraitement des signaux\nAnglais"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              UE (optionnel)
            </label>
            <input
              value={ueName}
              onChange={(e) => setUeName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ex: UE1 Informatique"
            />
            <p className="text-xs text-muted mt-1">Toutes les matières ajoutées seront rattachées à cette UE.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              ECTS (optionnel)
            </label>
            <input
              type="number"
              min="0"
              value={ects}
              onChange={(e) => setEcts(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ex: 6"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving || !newNames.trim()}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {saving ? "Ajout..." : "Ajouter"}
        </button>
      </form>

      {/* Subjects list */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Aucune matière"
          description="Ajoute tes matières pour commencer à organiser tes examens et révisions."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-card-bg border border-border rounded-xl p-4 flex items-center gap-3 card-interactive"
            >
              <div className="relative group">
                <div
                  className="w-4 h-4 rounded-full cursor-pointer"
                  style={{ backgroundColor: subject.color }}
                />
                <div className="absolute left-0 top-6 hidden group-hover:flex gap-1 bg-card-bg border border-border rounded-lg p-2 z-10 shadow-lg">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateColor(subject.id, c)}
                      className="w-5 h-5 rounded-full hover:scale-125 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{subject.name}</span>
                {(subject.ue_name || subject.ects > 0) && (
                  <p className="text-xs text-muted">
                    {subject.ue_name && <span>{subject.ue_name}</span>}
                    {subject.ue_name && subject.ects > 0 && " · "}
                    {subject.ects > 0 && <span>{subject.ects} ECTS</span>}
                  </p>
                )}
              </div>
              <button
                onClick={() => setDeleteTarget({ id: subject.id, name: subject.name })}
                className="p-1.5 text-muted hover:text-danger transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer la matière ?"
        message={`"${deleteTarget?.name ?? ""}" sera supprimée définitivement, ainsi que toutes les notes et examens associés.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
