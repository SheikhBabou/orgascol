"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Upload, X, Check, Loader2, Pencil, Clock } from "lucide-react";
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
  const [popover, setPopover] = useState<{ slot: ScheduleSlot; x: number; y: number } | null>(null);
  const [dragState, setDragState] = useState<{ dayIndex: number; startMin: number; currentMin: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  const subjectColorMap = new Map(subjects.map((s) => [s.name, s.color]));

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

      {/* Timeline grid */}
      {(() => {
        const gridStart = 7;
        const gridEnd = 21;
        const totalMinutes = (gridEnd - gridStart) * 60;
        const PX_PER_MIN = 0.7;

        function snapTo15(minutes: number): number {
          return Math.round(minutes / 15) * 15;
        }

        function getMinFromY(y: number): number {
          return snapTo15(Math.floor(y / PX_PER_MIN) + gridStart * 60);
        }

        function fmt(totalMin: number): string {
          const h = Math.floor(totalMin / 60);
          const m = totalMin % 60;
          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        }

        function handleDayMouseDown(dayIndex: number, e: React.MouseEvent<HTMLDivElement>) {
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const min = getMinFromY(y);
          setDragState({ dayIndex, startMin: min, currentMin: min });
          setPopover(null);
        }

        function handleDayMouseMove(e: React.MouseEvent<HTMLDivElement>) {
          if (!dragState) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const min = getMinFromY(y);
          setDragState((prev) => prev ? { ...prev, currentMin: min } : null);
        }

        function handleDayMouseUp() {
          if (!dragState) return;
          const minStart = Math.min(dragState.startMin, dragState.currentMin);
          const minEnd = Math.max(dragState.startMin, dragState.currentMin);
          if (minEnd - minStart >= 15) {
            setEditingId(null);
            setFormDay(dragState.dayIndex);
            setStartTime(fmt(minStart));
            setEndTime(fmt(minEnd));
            setSelectedSubject("");
            setFormError("");
          }
          setDragState(null);
        }

        return (
          <div className="bg-card-bg border border-border rounded-xl overflow-x-auto" ref={gridRef}>
            <div className="grid min-w-[700px]" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
              {/* Header */}
              <div className="border-b border-border bg-background/50 px-1 py-2" />
              {DAYS.map((day, dayIndex) => (
                <div
                  key={day}
                  onClick={() => openFormForDay(dayIndex)}
                  className="border-b border-l border-border bg-background/50 px-2 py-2 cursor-pointer hover:bg-primary/5 transition-colors"
                >
                  <p className="text-xs font-semibold text-center flex items-center justify-center gap-1">
                    {day}
                    <Plus className="w-3 h-3 text-muted" />
                  </p>
                </div>
              ))}

              {/* Time column */}
              <div className="relative" style={{ height: totalMinutes * PX_PER_MIN }}>
                {Array.from({ length: gridEnd - gridStart + 1 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute right-0 left-0 flex items-start justify-end pr-1.5"
                    style={{ top: i * 60 * PX_PER_MIN }}
                  >
                    <span className="text-[10px] text-muted leading-none -translate-y-1/2">
                      {String(gridStart + i).padStart(2, "0")}h
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {DAYS.map((day, dayIndex) => (
                <div
                  key={day}
                  className="relative border-l border-border select-none"
                  style={{ height: totalMinutes * PX_PER_MIN, cursor: "crosshair" }}
                  onMouseDown={(e) => handleDayMouseDown(dayIndex, e)}
                  onMouseMove={handleDayMouseMove}
                  onMouseUp={handleDayMouseUp}
                  onMouseLeave={() => { if (dragState) handleDayMouseUp(); }}
                >
                  {/* Hour lines */}
                  {Array.from({ length: gridEnd - gridStart + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-border/40"
                      style={{ top: i * 60 * PX_PER_MIN }}
                    />
                  ))}

                  {/* Drag preview */}
                  {dragState && dragState.dayIndex === dayIndex && Math.abs(dragState.currentMin - dragState.startMin) >= 15 && (
                    <div
                      className="absolute left-1 right-1 rounded-lg border-2 border-dashed border-primary bg-primary/10 flex items-center justify-center text-xs text-primary font-medium pointer-events-none"
                      style={{
                        top: (Math.min(dragState.startMin, dragState.currentMin) - gridStart * 60) * PX_PER_MIN,
                        height: Math.abs(dragState.currentMin - dragState.startMin) * PX_PER_MIN,
                      }}
                    >
                      {fmt(Math.min(dragState.startMin, dragState.currentMin))} - {fmt(Math.max(dragState.startMin, dragState.currentMin))}
                    </div>
                  )}

                  {/* Slots */}
                  {slotsByDay[dayIndex].map((slot) => {
                    const [sh, sm] = slot.start_time.split(":").map(Number);
                    const [eh, em] = slot.end_time.split(":").map(Number);
                    const startMin = sh * 60 + sm - gridStart * 60;
                    const endMin = eh * 60 + em - gridStart * 60;
                    const color = slot.label ? subjectColorMap.get(slot.label) : undefined;

                    return (
                      <button
                        key={slot.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPopover({
                            slot,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={`absolute left-1 right-1 rounded-lg border text-xs p-1.5 overflow-hidden transition-all hover:ring-2 hover:ring-primary/30 cursor-pointer z-10 ${
                          color ? "" : SLOT_COLOR
                        } ${popover?.slot.id === slot.id ? "ring-2 ring-primary" : ""}`}
                        style={{
                          top: startMin * PX_PER_MIN,
                          height: Math.max((endMin - startMin) * PX_PER_MIN, 24),
                          ...(color ? {
                            backgroundColor: `${color}18`,
                            borderColor: `${color}40`,
                            color,
                          } : {}),
                        }}
                      >
                        <p className="font-medium truncate leading-tight">
                          {slot.label || "Cours"}
                        </p>
                        <p
                          style={color ? { color, opacity: 0.7 } : undefined}
                          className={`leading-tight ${color ? "" : "opacity-75"}`}
                        >
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Popover */}
      {popover && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPopover(null)} />
          <div
            className="fixed z-50 bg-card-bg border border-border rounded-xl shadow-lg p-4 w-72 animate-fade-in"
            style={{
              left: Math.min(popover.x - 144, window.innerWidth - 300),
              top: popover.y - 10,
              transform: "translateY(-100%)",
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {(() => {
                    const c = popover.slot.label ? subjectColorMap.get(popover.slot.label) : undefined;
                    return c ? (
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c }} />
                    ) : null;
                  })()}
                  <h3 className="font-semibold text-sm">{popover.slot.label || "Cours"}</h3>
                </div>
                <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {DAYS[popover.slot.day_of_week]} &middot; {popover.slot.start_time.slice(0, 5)} - {popover.slot.end_time.slice(0, 5)}
                </p>
              </div>
              <button
                onClick={() => setPopover(null)}
                className="p-1 hover:bg-background rounded-lg transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  openEditSlot(popover.slot);
                  setPopover(null);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Modifier
              </button>
              <button
                onClick={() => {
                  setDeleteTarget({ id: popover.slot.id, name: popover.slot.label || "Cours" });
                  setPopover(null);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-danger/30 text-danger rounded-lg text-xs font-medium hover:bg-danger/5 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
          </div>
        </>
      )}

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
