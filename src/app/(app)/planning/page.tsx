"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, CalendarClock, CalendarDays, BookOpen, Clock, ChevronLeft, ChevronRight, X, Undo2, ThumbsUp } from "lucide-react";
import { format, parseISO, isToday, addDays, startOfWeek, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePlanning } from "@/utils/planning";
import type { Exam, ScheduleSlot, RevisionSession, SessionStatus } from "@/types/database";
import Link from "next/link";

const GRID_START = 7;
const GRID_END = 22;
const TOTAL_MINUTES = (GRID_END - GRID_START) * 60;
const PX_PER_MIN = 0.7;

function fmt(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const METHOD_LABELS: Record<string, string> = {
  first_read: "1re lecture",
  active_review: "Révision active",
  spaced_repetition: "Rép. espacée",
  final_review: "Relecture finale",
};

export default function PlanningPage() {
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExams, setHasExams] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [popover, setPopover] = useState<{ session: RevisionSession; x: number; y: number } | null>(null);
  const [showThumbsUp, setShowThumbsUp] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const autoGenerate = useCallback(async () => {
    const [examsRes, slotsRes, userRes, gradesRes] = await Promise.all([
      supabase
        .from("exams")
        .select("*, subject:subjects(*), chapters(*)"),
      supabase.from("schedule_slots").select("*"),
      supabase.auth.getUser(),
      supabase.from("grades").select("subject_id, grade, max_grade, coefficient"),
    ]);

    const exams: Exam[] = examsRes.data ?? [];
    const slots: ScheduleSlot[] = slotsRes.data ?? [];
    const userId = userRes.data.user?.id;

    setHasExams(exams.length > 0);
    setHasSchedule(slots.length > 0);

    if (!userId) return;

    const subjectAverages = new Map<string, number>();
    if (gradesRes.data) {
      const bySubject = new Map<string, { tw: number; tc: number }>();
      for (const g of gradesRes.data) {
        const entry = bySubject.get(g.subject_id) ?? { tw: 0, tc: 0 };
        const normalized = (g.grade / g.max_grade) * 20;
        entry.tw += normalized * g.coefficient;
        entry.tc += g.coefficient;
        bySubject.set(g.subject_id, entry);
      }
      for (const [id, { tw, tc }] of bySubject) {
        if (tc > 0) subjectAverages.set(id, tw / tc);
      }
    }

    const hasUpcomingChapters = exams.some(
      (e) =>
        new Date(e.exam_date) >= new Date() &&
        (e.chapters ?? []).some((c) => c.status !== "completed")
    );

    if (hasUpcomingChapters && slots.length > 0) {
      const { data: existingSessions } = await supabase
        .from("revision_sessions")
        .select("chapter_id, scheduled_date, start_time, status");

      const doneKeys = new Set(
        (existingSessions ?? [])
          .filter((s) => s.status === "completed" || s.status === "skipped")
          .map((s) => `${s.chapter_id}-${s.scheduled_date}-${s.start_time}`)
      );

      const newSessions = generatePlanning(exams, slots, subjectAverages)
        .filter((s) => !doneKeys.has(`${s.chapter_id}-${s.scheduled_date}-${s.start_time}`))
        .map((s) => ({
          ...s,
          user_id: userId,
          status: "pending" as const,
        }));

      await supabase
        .from("revision_sessions")
        .delete()
        .eq("status", "pending");

      if (newSessions.length > 0) {
        await supabase.from("revision_sessions").insert(newSessions);
      }
    }

    const { data } = await supabase
      .from("revision_sessions")
      .select("*, chapter:chapters(*, exam:exams(*, subject:subjects(*)))")
      .order("scheduled_date")
      .order("start_time");
    if (data) setSessions(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    autoGenerate();
  }, [autoGenerate]);

  async function updateStatus(id: string, status: SessionStatus) {
    await supabase
      .from("revision_sessions")
      .update({ status })
      .eq("id", id);

    if (status === "completed") {
      setShowThumbsUp(true);
      setTimeout(() => setShowThumbsUp(false), 1500);

      const session = sessions.find((s) => s.id === id);
      if (session?.chapter_id) {
        const others = sessions.filter(
          (s) => s.chapter_id === session.chapter_id && s.id !== id
        );
        const allDone = others.every(
          (s) => s.status === "completed" || s.status === "skipped"
        );
        await supabase
          .from("chapters")
          .update({ status: allDone ? "completed" : "in_progress" })
          .eq("id", session.chapter_id);
      }
    }

    if (status === "pending") {
      const session = sessions.find((s) => s.id === id);
      if (session?.chapter_id) {
        await supabase
          .from("chapters")
          .update({ status: "in_progress" })
          .eq("id", session.chapter_id);
      }
    }

    const { data } = await supabase
      .from("revision_sessions")
      .select("*, chapter:chapters(*, exam:exams(*, subject:subjects(*)))")
      .order("scheduled_date")
      .order("start_time");
    if (data) setSessions(data);
    setPopover(null);
  }

  async function postponeSession(id: string) {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;

    const { data: slots } = await supabase.from("schedule_slots").select("*");
    const scheduleSlots: ScheduleSlot[] = slots ?? [];

    const sessionDuration = (() => {
      const [sh, sm] = session.start_time.split(":").map(Number);
      const [eh, em] = session.end_time.split(":").map(Number);
      return (eh * 60 + em) - (sh * 60 + sm);
    })();

    const bookedKeys = new Set(
      sessions
        .filter((s) => s.id !== id && s.status !== "completed")
        .map((s) => `${s.scheduled_date}-${s.start_time}`)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let searchDate = addDays(parseISO(session.scheduled_date), 1);

    for (let attempt = 0; attempt < 30; attempt++) {
      const dayOfWeek = (searchDate.getDay() + 6) % 7;
      const dateStr = format(searchDate, "yyyy-MM-dd");
      const isSunday = dayOfWeek === 6;
      const dayStart = isSunday ? 19 * 60 : 8 * 60;
      const dayEnd = isSunday ? 22 * 60 : 22 * 60;

      const classBlocks = scheduleSlots
        .filter((s) => s.day_of_week === dayOfWeek)
        .map((s) => {
          const [sh, sm] = s.start_time.split(":").map(Number);
          const [eh, em] = s.end_time.split(":").map(Number);
          return { start: sh * 60 + sm, end: eh * 60 + em };
        })
        .sort((a, b) => a.start - b.start);

      const revBlocks = sessions
        .filter((s) => s.id !== id && s.scheduled_date === dateStr && s.status !== "completed")
        .map((s) => {
          const [sh, sm] = s.start_time.split(":").map(Number);
          const [eh, em] = s.end_time.split(":").map(Number);
          return { start: sh * 60 + sm, end: eh * 60 + em };
        });

      const occupied = [...classBlocks, ...revBlocks].sort((a, b) => a.start - b.start);
      const merged: { start: number; end: number }[] = [];
      for (const block of occupied) {
        if (merged.length > 0 && block.start <= merged[merged.length - 1].end) {
          merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, block.end);
        } else {
          merged.push({ ...block });
        }
      }

      let cursor = dayStart;
      for (const block of merged) {
        if (block.start - cursor >= sessionDuration) {
          const startH = Math.floor(cursor / 60);
          const startM = cursor % 60;
          const endCursor = cursor + sessionDuration;
          const endH = Math.floor(endCursor / 60);
          const endM = endCursor % 60;
          const newStart = `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`;
          const newEnd = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

          await supabase
            .from("revision_sessions")
            .update({ scheduled_date: dateStr, start_time: newStart, end_time: newEnd })
            .eq("id", id);

          const { data } = await supabase
            .from("revision_sessions")
            .select("*, chapter:chapters(*, exam:exams(*, subject:subjects(*)))")
            .order("scheduled_date")
            .order("start_time");
          if (data) setSessions(data);
          setPopover(null);
          return;
        }
        cursor = Math.max(cursor, block.end);
      }

      if (dayEnd - cursor >= sessionDuration) {
        const startH = Math.floor(cursor / 60);
        const startM = cursor % 60;
        const endCursor = cursor + sessionDuration;
        const endH = Math.floor(endCursor / 60);
        const endM = endCursor % 60;
        const newStart = `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`;
        const newEnd = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

        await supabase
          .from("revision_sessions")
          .update({ scheduled_date: dateStr, start_time: newStart, end_time: newEnd })
          .eq("id", id);

        const { data } = await supabase
          .from("revision_sessions")
          .select("*, chapter:chapters(*, exam:exams(*, subject:subjects(*)))")
          .order("scheduled_date")
          .order("start_time");
        if (data) setSessions(data);
        setPopover(null);
        return;
      }

      searchDate = addDays(searchDate, 1);
    }

    setPopover(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!hasExams && !hasSchedule) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Planning de révisions</h1>
          <p className="text-muted text-sm mt-1">Ton planning se génère automatiquement</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center space-y-4">
          <CalendarDays className="w-12 h-12 text-muted mx-auto" />
          <h2 className="text-lg font-semibold">Pour commencer</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Renseigne tes matières, tes examens avec leurs chapitres, et ton emploi du temps.
            Le planning se créera automatiquement.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/subjects" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
              Ajouter des matières
            </Link>
            <Link href="/schedule" className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-background transition-colors">
              Saisir l&apos;emploi du temps
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasExams) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Planning de révisions</h1>
          <p className="text-muted text-sm mt-1">Ton planning se génère automatiquement</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-muted mx-auto" />
          <h2 className="text-lg font-semibold">Ajoute tes examens</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Ton emploi du temps est renseigné. Ajoute maintenant tes examens avec leurs chapitres.
          </p>
          <Link href="/exams" className="inline-flex px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
            Ajouter des examens
          </Link>
        </div>
      </div>
    );
  }

  if (!hasSchedule) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Planning de révisions</h1>
          <p className="text-muted text-sm mt-1">Ton planning se génère automatiquement</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center space-y-4">
          <Clock className="w-12 h-12 text-muted mx-auto" />
          <h2 className="text-lg font-semibold">Saisis ton emploi du temps</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Tes examens sont enregistrés. Renseigne tes heures de cours pour utiliser tes créneaux libres.
          </p>
          <Link href="/schedule" className="inline-flex px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
            Saisir l&apos;emploi du temps
          </Link>
        </div>
      </div>
    );
  }

  const completed = sessions.filter((s) => s.status === "completed");
  const pending = sessions.filter((s) => s.status === "pending");
  const pct = sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0;

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekDayStrs = weekDays.map((d) => format(d, "yyyy-MM-dd"));

  const sessionsByDate: Record<string, RevisionSession[]> = {};
  for (const s of sessions) {
    if (!sessionsByDate[s.scheduled_date]) sessionsByDate[s.scheduled_date] = [];
    sessionsByDate[s.scheduled_date].push(s);
  }

  const weekLabel = `${format(weekDays[0], "d MMM", { locale: fr })} - ${format(weekDays[6], "d MMM yyyy", { locale: fr })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Planning de révisions</h1>
          <p className="text-muted text-sm mt-1">
            {pending.length} session{pending.length > 1 ? "s" : ""} restante{pending.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            className="p-2 border border-border rounded-lg hover:bg-background transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-background transition-colors"
          >
            Cette semaine
          </button>
          <button
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            className="p-2 border border-border rounded-lg hover:bg-background transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-muted ml-2 hidden md:inline capitalize">{weekLabel}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card-bg border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progression globale</span>
          <span className="text-sm font-bold text-primary">{pct}%</span>
        </div>
        <div className="w-full h-2.5 bg-border/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted">
          <span>{completed.length} terminée{completed.length > 1 ? "s" : ""}</span>
          <span>{pending.length} restante{pending.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Timeline grid */}
      <div className="bg-card-bg border border-border rounded-xl overflow-x-auto" ref={gridRef}>
        <div className="grid min-w-[700px]" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
          {/* Header */}
          <div className="border-b border-border bg-background/50 px-1 py-2" />
          {weekDays.map((day, i) => {
            const dateStr = weekDayStrs[i];
            const daySessionCount = (sessionsByDate[dateStr] ?? []).filter((s) => s.status === "pending").length;
            const today = isToday(day);
            return (
              <div
                key={i}
                className={`border-b border-l border-border px-2 py-2 text-center ${today ? "bg-primary/5" : "bg-background/50"}`}
              >
                <p className={`text-[10px] uppercase tracking-wider ${today ? "text-primary font-bold" : "text-muted"}`}>
                  {format(day, "EEE", { locale: fr })}
                </p>
                <p className={`text-sm font-semibold ${today ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </p>
                {daySessionCount > 0 && (
                  <span className="inline-block mt-0.5 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                    {daySessionCount}
                  </span>
                )}
              </div>
            );
          })}

          {/* Time column */}
          <div className="relative" style={{ height: TOTAL_MINUTES * PX_PER_MIN }}>
            {Array.from({ length: GRID_END - GRID_START + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute right-0 left-0 flex items-start justify-end pr-1.5"
                style={{ top: i * 60 * PX_PER_MIN }}
              >
                <span className="text-[10px] text-muted leading-none -translate-y-1/2">
                  {fmt((GRID_START + i) * 60)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dateStr = weekDayStrs[dayIndex];
            const daySessions = sessionsByDate[dateStr] ?? [];
            const today = isToday(day);

            return (
              <div
                key={dayIndex}
                className={`relative border-l border-border ${today ? "bg-primary/[0.02]" : ""}`}
                style={{ height: TOTAL_MINUTES * PX_PER_MIN }}
              >
                {/* Hour lines */}
                {Array.from({ length: GRID_END - GRID_START + 1 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-border/40"
                    style={{ top: i * 60 * PX_PER_MIN }}
                  />
                ))}

                {/* Now indicator */}
                {today && (() => {
                  const now = new Date();
                  const nowMin = now.getHours() * 60 + now.getMinutes();
                  if (nowMin < GRID_START * 60 || nowMin > GRID_END * 60) return null;
                  return (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-danger z-20 pointer-events-none"
                      style={{ top: (nowMin - GRID_START * 60) * PX_PER_MIN }}
                    >
                      <div className="w-2 h-2 rounded-full bg-danger -translate-y-1/2 -translate-x-1/2" />
                    </div>
                  );
                })()}

                {/* Sessions */}
                {daySessions.map((session) => {
                  const [sh, sm] = session.start_time.split(":").map(Number);
                  const [eh, em] = session.end_time.split(":").map(Number);
                  const startMin = sh * 60 + sm - GRID_START * 60;
                  const endMin = eh * 60 + em - GRID_START * 60;
                  const color = session.chapter?.exam?.subject?.color ?? "#6366f1";
                  const isDone = session.status === "completed";
                  const isSkipped = session.status === "skipped";

                  return (
                    <button
                      key={session.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setPopover({
                          session,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      className={`absolute left-1 right-1 rounded-lg border text-xs p-1.5 overflow-hidden transition-all hover:ring-2 hover:ring-primary/30 cursor-pointer z-10 ${
                        popover?.session.id === session.id ? "ring-2 ring-primary" : ""
                      } ${isDone ? "opacity-50" : isSkipped ? "opacity-30" : ""}`}
                      style={{
                        top: startMin * PX_PER_MIN,
                        height: Math.max((endMin - startMin) * PX_PER_MIN, 24),
                        backgroundColor: `${color}18`,
                        borderColor: isDone ? "#22c55e40" : `${color}40`,
                        color,
                      }}
                    >
                      <p className={`font-medium truncate leading-tight ${isDone ? "line-through" : ""}`}>
                        {session.chapter?.title}
                      </p>
                      <p className="leading-tight" style={{ opacity: 0.7 }}>
                        {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                      </p>
                      {(endMin - startMin) * PX_PER_MIN > 50 && (
                        <p className="leading-tight mt-0.5" style={{ opacity: 0.6, fontSize: "9px" }}>
                          {session.chapter?.exam?.subject?.name}
                        </p>
                      )}
                      {isDone && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle2 className="w-3 h-3 text-success" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Thumbs up animation */}
      {showThumbsUp && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
          <div className="animate-bounce">
            <div className="bg-success/20 rounded-full p-8">
              <ThumbsUp className="w-20 h-20 text-success" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      )}

      {/* Popover */}
      {popover && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPopover(null)} />
          <div
            className="fixed z-50 bg-card-bg border border-border rounded-xl shadow-lg p-4 w-80 animate-fade-in"
            style={{
              left: Math.min(Math.max(popover.x - 160, 12), window.innerWidth - 332),
              top: popover.y - 10,
              transform: "translateY(-100%)",
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: popover.session.chapter?.exam?.subject?.color ?? "#6366f1" }}
                  />
                  <h3 className="font-semibold text-sm truncate">{popover.session.chapter?.title}</h3>
                </div>
                <p className="text-xs text-muted mt-1">
                  {popover.session.chapter?.exam?.subject?.name} &middot; {popover.session.chapter?.exam?.title}
                </p>
                <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {format(parseISO(popover.session.scheduled_date), "EEEE d MMMM", { locale: fr })} &middot; {popover.session.start_time.slice(0, 5)} - {popover.session.end_time.slice(0, 5)}
                </p>
                <span
                  className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${popover.session.chapter?.exam?.subject?.color ?? "#6366f1"}15`,
                    color: popover.session.chapter?.exam?.subject?.color ?? "#6366f1",
                  }}
                >
                  {METHOD_LABELS[popover.session.method] ?? popover.session.method}
                </span>
              </div>
              <button
                onClick={() => setPopover(null)}
                className="p-1 hover:bg-background rounded-lg transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {popover.session.status === "pending" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(popover.session.id, "completed")}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-success/10 text-success rounded-lg text-sm font-medium hover:bg-success/20 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Fait !
                </button>
                <button
                  onClick={() => postponeSession(popover.session.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <CalendarClock className="w-4 h-4" />
                  Reporter
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="flex-1 text-xs font-medium text-center py-1.5 rounded-lg bg-success/10 text-success">
                  Terminée
                </p>
                <button
                  onClick={() => updateStatus(popover.session.id, "pending")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-muted hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
