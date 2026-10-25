"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import type { ScheduleSlot, SlotType } from "@/types/database";

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

  // Form
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [label, setLabel] = useState("");
  const [slotType, setSlotType] = useState<SlotType>("class");
  const [saving, setSaving] = useState(false);

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
    await supabase.from("schedule_slots").insert({
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      label: label || null,
      slot_type: slotType,
    });
    setLabel("");
    setShowForm(false);
    setSaving(false);
    loadSlots();
  }

  async function deleteSlot(id: string) {
    await supabase.from("schedule_slots").delete().eq("id", id);
    loadSlots();
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
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter un créneau
        </button>
      </div>

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

      {/* Weekly grid */}
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
                        onClick={() => deleteSlot(slot.id)}
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
    </div>
  );
}
