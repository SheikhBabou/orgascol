"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Upload, X, Check, Loader2 } from "lucide-react";
import type { ScheduleSlot, SlotType } from "@/types/database";
import ConfirmDialog from "@/components/confirm-dialog";

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const SLOT_TYPE_LABELS: Record<SlotType, string> = {
  class: "Cours",
  busy: "Occupé",
  revision: "Révision",
};

const SLOT_TYPE_COLORS: Record<SlotType, string> = {
  class: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  busy: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  revision: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
};

export default function SchedulePage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [label, setLabel] = useState("");
  const [slotType, setSlotType] = useState<SlotType>("class");
  const [saving, setSaving] = useState(false);

  const [showImport, setShowImport] = useState(false);
  const [icalUrl, setIcalUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [previewSlots, setPreviewSlots] = useState<
    { day_of_week: number; start_time: string; end_time: string; label: string; selected: boolean }[]
  >([]);
  const [importStep, setImportStep] = useState<"url" | "preview">("url");
  const [insertingImport, setInsertingImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadSlots();
  }, []);

  async function loadSlots() {
    const { data } = await supabase
      .from("schedule_slots")
      .select("*")
      .order("day_of_week")
      .order("start_time");
    if (data) setSlots(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from("schedule_slots").insert({
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      label: label || null,
      slot_type: slotType,
      user_id: user.id,
    });
    setLabel("");
    setShowForm(false);
    setSaving(false);
    loadSlots();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await supabase.from("schedule_slots").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    loadSlots();
  }

  async function fetchIcalPreview() {
    setImporting(true);
    setImportError("");
    try {
      const res = await fetch("/api/import-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: icalUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Erreur lors de l'import");
        return;
      }
      if (data.slots.length === 0) {
        setImportError("Aucun créneau trouvé dans ce calendrier.");
        return;
      }
      setPreviewSlots(data.slots.map((s: { day_of_week: number; start_time: string; end_time: string; label: string }) => ({ ...s, selected: true })));
      setImportStep("preview");
    } catch {
      setImportError("Impossible de contacter le serveur.");
    } finally {
      setImporting(false);
    }
  }

  async function confirmImport() {
    setInsertingImport(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setInsertingImport(false); return; }

    const toInsert = previewSlots
      .filter((s) => s.selected)
      .map((s) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        label: s.label,
        slot_type: "class" as SlotType,
        user_id: user.id,
      }));

    if (toInsert.length > 0) {
      await supabase.from("schedule_slots").insert(toInsert);
    }

    resetImport();
    loadSlots();
  }

  function resetImport() {
    setShowImport(false);
    setIcalUrl("");
    setImportError("");
    setPreviewSlots([]);
    setImportStep("url");
    setInsertingImport(false);
  }

  function togglePreviewSlot(index: number) {
    setPreviewSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s))
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const slotsByDay = DAYS.map((_, i) =>
    slots.filter((s) => s.day_of_week === i)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Emploi du temps</h1>
          <p className="text-muted text-sm mt-1">
            Indique tes créneaux de cours, occupations et disponibilités
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-background transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            Importer (iCal)
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter un créneau
          </button>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg border border-border rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold">
                {importStep === "url" ? "Importer un emploi du temps" : "Aperçu des créneaux"}
              </h2>
              <button onClick={resetImport} className="p-1 hover:bg-background rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {importStep === "url" && (
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted">
                  Colle l&#39;URL de ton calendrier iCal (.ics) pour importer automatiquement tes créneaux de cours.
                </p>
                <input
                  value={icalUrl}
                  onChange={(e) => setIcalUrl(e.target.value)}
                  placeholder="https://example.com/calendar.ics"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {importError && (
                  <p className="text-sm text-red-500">{importError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={fetchIcalPreview}
                    disabled={importing || !icalUrl.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
                  >
                    {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {importing ? "Chargement..." : "Charger"}
                  </button>
                  <button
                    onClick={resetImport}
                    className="px-6 py-2 border border-border rounded-lg text-sm hover:bg-background transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {importStep === "preview" && (
              <div className="flex flex-col overflow-hidden">
                <div className="p-4 overflow-y-auto flex-1">
                  <p className="text-sm text-muted mb-3">
                    {previewSlots.filter((s) => s.selected).length} / {previewSlots.length} créneaux sélectionnés
                  </p>
                  <div className="space-y-1.5">
                    {previewSlots.map((slot, i) => (
                      <label
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          slot.selected
                            ? "border-primary/50 bg-primary/5"
                            : "border-border opacity-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={slot.selected}
                          onChange={() => togglePreviewSlot(i)}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{slot.label}</p>
                          <p className="text-xs text-muted">
                            {DAYS[slot.day_of_week]} &middot; {slot.start_time} - {slot.end_time}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-border flex gap-3">
                  <button
                    onClick={confirmImport}
                    disabled={insertingImport || previewSlots.filter((s) => s.selected).length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
                  >
                    {insertingImport ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {insertingImport ? "Import en cours..." : "Importer la sélection"}
                  </button>
                  <button
                    onClick={() => { setImportStep("url"); setPreviewSlots([]); }}
                    className="px-6 py-2 border border-border rounded-lg text-sm hover:bg-background transition-colors"
                  >
                    Retour
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card-bg border border-border rounded-xl p-6 space-y-4"
        >
          <h2 className="font-semibold">Nouveau créneau</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Jour *</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {DAYS.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Type *</label>
              <select
                value={slotType}
                onChange={(e) => setSlotType(e.target.value as SlotType)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="class">Cours</option>
                <option value="busy">Occupé</option>
                <option value="revision">Créneau de révision</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Début *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Fin *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">
                Libellé (optionnel)
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Ex: Maths, Sport, Travail..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-border rounded-lg text-sm hover:bg-background transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="bg-card-bg border border-border rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-border bg-background/50">
              <p className="text-sm font-semibold text-center">{day}</p>
            </div>
            <div className="p-2 space-y-1.5 min-h-[100px]">
              {slotsByDay[dayIndex].length === 0 ? (
                <p className="text-xs text-muted text-center py-4">—</p>
              ) : (
                slotsByDay[dayIndex].map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-2 rounded-lg border text-xs ${SLOT_TYPE_COLORS[slot.slot_type]}`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <p className="font-medium">
                          {slot.label || SLOT_TYPE_LABELS[slot.slot_type]}
                        </p>
                        <p className="opacity-75">
                          {slot.start_time.slice(0, 5)} -{" "}
                          {slot.end_time.slice(0, 5)}
                        </p>
                      </div>
                      <button
                        onClick={() => setDeleteTarget({ id: slot.id, name: slot.label || SLOT_TYPE_LABELS[slot.slot_type] })}
                        className="opacity-50 hover:opacity-100 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer le créneau ?"
        message={`"${deleteTarget?.name ?? ""}" sera supprimé de ton emploi du temps.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
