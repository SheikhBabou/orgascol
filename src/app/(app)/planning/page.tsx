"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, SkipForward, CalendarDays, BookOpen, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePlanning } from "@/utils/planning";
import type { Exam, ScheduleSlot, RevisionSession, SessionStatus } from "@/types/database";
import Link from "next/link";

function formatDateLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return "Demain";
  return format(d, "EEEE d MMMM", { locale: fr });
}

function daysUntilLabel(dateStr: string): string {
  const days = differenceInDays(parseISO(dateStr), new Date());
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  return `J-${days}`;
}

export default function PlanningPage() {
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExams, setHasExams] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [view, setView] = useState<"agenda" | "exams">("agenda");
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const supabase = createClient();

  const autoGenerate = useCallback(async () => {
    const [examsRes, slotsRes, userRes] = await Promise.all([
      supabase
        .from("exams")
        .select("*, subject:subjects(*), chapters(*)"),
      supabase.from("schedule_slots").select("*"),
      supabase.auth.getUser(),
    ]);

    const exams: Exam[] = examsRes.data ?? [];
    const slots: ScheduleSlot[] = slotsRes.data ?? [];
    const userId = userRes.data.user?.id;

    setHasExams(exams.length > 0);
    setHasSchedule(slots.length > 0);

    if (!userId) return;

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

      const newSessions = generatePlanning(exams, slots)
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

    const { data } = await supabase
      .from("revision_sessions")
      .select("*, chapter:chapters(*, exam:exams(*, subject:subjects(*)))")
      .order("scheduled_date")
      .order("start_time");
    if (data) setSessions(data);
  }

  function toggleDate(date: string) {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
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

  const pending = sessions.filter((s) => s.status === "pending");
  const completed = sessions.filter((s) => s.status === "completed");
  const pct = sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0;

  const todaySessions = sessions.filter(
    (s) => isToday(parseISO(s.scheduled_date)) && s.status === "pending"
  );

  const sessionsByDate = pending.reduce(
    (acc, s) => {
      const date = s.scheduled_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(s);
      return acc;
    },
    {} as Record<string, RevisionSession[]>
  );
  const dates = Object.keys(sessionsByDate).sort();

  const examMap = new Map<string, { exam: Exam & { subject?: { name: string; color: string } }; sessions: RevisionSession[] }>();
  for (const s of sessions) {
    const exam = s.chapter?.exam;
    if (!exam) continue;
    if (!examMap.has(exam.id)) examMap.set(exam.id, { exam: exam as Exam & { subject?: { name: string; color: string } }, sessions: [] });
    examMap.get(exam.id)!.sessions.push(s);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Planning de révisions</h1>
          <p className="text-muted text-sm mt-1">
            Généré automatiquement - {pending.length} session{pending.length > 1 ? "s" : ""} restante{pending.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex bg-background border border-border rounded-lg p-0.5">
          <button
            onClick={() => setView("agenda")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "agenda" ? "bg-primary text-white" : "text-muted hover:text-foreground"
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setView("exams")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "exams" ? "bg-primary text-white" : "text-muted hover:text-foreground"
            }`}
          >
            Par examen
          </button>
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

      {/* Today highlight */}
      {todaySessions.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Aujourd&apos;hui - {todaySessions.length} session{todaySessions.length > 1 ? "s" : ""}
          </h2>
          {todaySessions.map((s) => (
            <SessionCard key={s.id} session={s} onStatus={updateStatus} />
          ))}
        </div>
      )}

      {view === "agenda" ? (
        /* Agenda view */
        dates.length === 0 ? (
          <div className="bg-card-bg border border-border rounded-xl p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
            <h2 className="text-lg font-semibold">Tout est révisé !</h2>
            <p className="text-sm text-muted">Ajoute de nouveaux examens pour générer de nouvelles sessions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dates.map((date) => {
              const isExpanded = !collapsedDates.has(date);
              const daySessions = sessionsByDate[date];
              return (
                <div key={date} className="bg-card-bg border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleDate(date)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold capitalize">{formatDateLabel(date)}</span>
                      <span className="text-xs text-muted bg-background px-2 py-0.5 rounded-full">
                        {daySessions.length} session{daySessions.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-2">
                      {daySessions.map((s) => (
                        <SessionCard key={s.id} session={s} onStatus={updateStatus} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Exam view */
        <div className="space-y-4">
          {Array.from(examMap.values())
            .sort((a, b) => a.exam.exam_date.localeCompare(b.exam.exam_date))
            .map(({ exam, sessions: examSessions }) => {
              const done = examSessions.filter((s) => s.status === "completed").length;
              const total = examSessions.length;
              const examPct = total > 0 ? Math.round((done / total) * 100) : 0;
              const color = exam.subject?.color ?? "#6366f1";

              return (
                <div key={exam.id} className="bg-card-bg border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{exam.title}</p>
                      <p className="text-xs text-muted">{exam.subject?.name} - {daysUntilLabel(exam.exam_date)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color }}>{examPct}%</p>
                      <p className="text-[10px] text-muted">{done}/{total}</p>
                    </div>
                  </div>
                  <div className="px-4 pt-2 pb-1">
                    <div className="w-full h-1.5 bg-border/50 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full transition-all" style={{ width: `${examPct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                  <div className="px-4 pb-3 space-y-2">
                    {examSessions.map((s) => (
                      <SessionCard key={s.id} session={s} onStatus={updateStatus} compact />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  onStatus,
  compact,
}: {
  session: RevisionSession;
  onStatus: (id: string, status: SessionStatus) => void;
  compact?: boolean;
}) {
  const color = session.chapter?.exam?.subject?.color ?? "#6366f1";
  const isDone = session.status === "completed";
  const isSkipped = session.status === "skipped";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        isDone
          ? "bg-success/5 border-success/20 opacity-70"
          : isSkipped
            ? "bg-background border-border opacity-50"
            : "bg-background border-border hover:border-primary/30"
      }`}
    >
      <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDone ? "line-through text-muted" : ""}`}>
          {session.chapter?.title}
        </p>
        <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3" />
          {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
          {!compact && (
            <>
              {" "}&middot; {session.chapter?.exam?.subject?.name} &middot; {session.chapter?.exam?.title}
            </>
          )}
        </p>
      </div>
      {session.status === "pending" && (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onStatus(session.id, "completed")}
            className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
            title="Fait"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onStatus(session.id, "skipped")}
            className="p-1.5 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
            title="Passer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      )}
      {isDone && <span className="text-xs text-success font-medium shrink-0">Fait</span>}
      {isSkipped && <span className="text-xs text-warning font-medium shrink-0">Passé</span>}
    </div>
  );
}
