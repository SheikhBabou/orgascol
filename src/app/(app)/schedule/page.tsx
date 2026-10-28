"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Upload, X, Check, Loader2 } from "lucide-react";
import type { ScheduleSlot, SlotType, Subject } from "@/types/database";
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

const SLOT_COLOR = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7h - 21h
const MINUTES = ["00", "15", "30"];

function TimeSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [h, m] = value.split(":");
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label} *</label>
      <div className="flex items-center gap-1.5">
        <select
          value={h}
          onChange={(e) => onChange(`${e.target.value}:${m}`)}
          className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {HOURS.map((hr) => (
            <option key={hr} value={String(hr).padStart(2, "0")}>
              {String(hr).padStart(2, "0")}h
            </option>
          ))}
        </select>
        <span className="text-muted font-bold">:</span>
        <select
          value={m}
          onChange={(e) => onChange(`${h}:${e.target.value}`)}
          className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {MINUTES.map((min) => (
            <option key={min} value={min}>
              {min}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDay, setFormDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

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
    loadData();
  }, []);

  async function loadData() {
    const [slotsRes, subjectsRes] = await Promise.all([
      supabase
        .from("schedule_slots")
        .select("*")
        .order("day_of_week")
        .order("start_time"),
      supabase.from("subjects").select("*").order("name"),
    ]);
    if (slotsRes.data) setSlots(slotsRes.data);
    if (subjectsRes.data) setSubjects(subjectsRes.data);
    setLoading(false);
  }

  function openFormForDay(dayIndex: number) {
    setEditingId(null);
    setFormDay(dayIndex);
    setStartTime("08:00");
    setEndTime("09:00");
    setSelectedSubject("");
    setFormError("");
  }

  function openEditSlot(slot: ScheduleSlot) {
    setEditingId(slot.id);
    setFormDay(slot.day_of_week);
    setStartTime(slot.start_time.slice(0, 5));
    setEndTime(slot.end_time.slice(0, 5));
    setSelectedSubject(slot.label ?? "");
    setFormError("");
  }

  function closeForm() {
    setFormDay(null);
    setEditingId(null);
    setFormError("");
  }

  function hasOverlap(day: number, start: string, end: string, excludeId?: string): boolean {
    return slots.some(
      (s) =>
        s.day_of_week === day &&
        s.id !== excludeId &&
        s.start_time.slice(0, 5) < end &&
        s.end_time.slice(0, 5) > start
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formDay === null) return;
    setFormError("");

    if (startTime >= endTime) {
      setFormError("L'heure de fin doit être après l'heure de début.");
      return;
    }

    if (hasOverlap(formDay, startTime, endTime, editingId ?? undefined)) {
      setFormError("Un créneau existe déjà sur cette plage horaire.");
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const label = selectedSubject || null;

    if (editingId) {
      await supabase
        .from("schedule_slots")
        .update({
          day_of_week: formDay,
          start_time: startTime,
          end_time: endTime,
          label,
          slot_type: "class" as SlotType,
        })
        .eq("id", editingId);
    } else {
      await supabase.from("schedule_slots").insert({
        day_of_week: formDay,
        start_time: startTime,
        end_time: endTime,
        label,
        slot_type: "class" as SlotType,
        user_id: user.id,
      });
    }

    closeForm();
    setSaving(false);
    loadData();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await supabase.from("schedule_slots").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    if (editingId === deleteTarget.id) closeForm();
    loadData();
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
    loadData();
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Emploi du temps</h1>
          <p className="text-muted text-sm mt-1">
            Saisis tes heures de cours. Clique sur un jour pour ajouter, sur un cours pour le modifier.
          </p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-background transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          Importer (iCal)
        </button>
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-overlay-in">
          <div className="bg-card-bg border border-border rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-fade-in-scale">
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

      {/* Inline form (appears when a day is clicked or a slot is being edited) */}
      {formDay !== null && (
        <form
          onSubmit={handleSubmit}
          className="bg-card-bg border border-primary/30 rounded-xl p-5 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {editingId ? "Modifier le créneau" : "Nouveau créneau"} - {DAYS[formDay]}
            </h2>
            <button type="button" onClick={closeForm} className="p-1 hover:bg-background rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Jour *</label>
              <select
                value={formDay}
                onChange={(e) => setFormDay(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {DAYS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <TimeSelect label="Début" value={startTime} onChange={setStartTime} />
            <TimeSelect label="Fin" value={endTime} onChange={setEndTime} />
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1.5">Matière *</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Sélectionner une matière</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              {subjects.length === 0 && (
                <p className="text-xs text-muted mt-1">
                  Aucune matière créée. Ajoute tes matières dans l&apos;onglet Matières d&apos;abord.
                </p>
              )}
            </div>
          </div>

          {formError && (
            <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{formError}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {saving ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-6 py-2 border border-border rounded-lg text-sm hover:bg-background transition-colors"
            >
              Annuler
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  const slot = slots.find((s) => s.id === editingId);
                  if (slot) setDeleteTarget({ id: slot.id, name: slot.label || "Cours" });
                }}
                className="flex items-center gap-2 px-4 py-2 border border-danger/30 text-danger rounded-lg text-sm hover:bg-danger/5 transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            )}
          </div>
        </form>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 stagger-children">
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="bg-card-bg border border-border rounded-xl overflow-hidden card-interactive">
            <button
              onClick={() => openFormForDay(dayIndex)}
              className="w-full px-3 py-2 border-b border-border bg-background/50 hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <p className="text-sm font-semibold text-center flex items-center justify-center gap-1.5">
                {day}
                <Plus className="w-3 h-3 text-muted" />
              </p>
            </button>
            <div className="p-2 space-y-1.5 min-h-[100px]">
              {slotsByDay[dayIndex].length === 0 ? (
                <button
                  onClick={() => openFormForDay(dayIndex)}
                  className="w-full text-xs text-muted text-center py-4 hover:text-primary transition-colors cursor-pointer"
                >
                  + Ajouter
                </button>
              ) : (
                slotsByDay[dayIndex].map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => openEditSlot(slot)}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-all hover:ring-2 hover:ring-primary/30 cursor-pointer ${SLOT_COLOR} ${
                      editingId === slot.id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <p className="font-medium">
                      {slot.label || "Cours"}
                    </p>
                    <p className="opacity-75">
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </p>
                  </button>
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
