"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Bell,
  BellOff,
  BellRing,
  FolderOpen,
  Sparkles,
  Target,
  Flame,
  X,
  Phone,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Exam, RevisionSession, Project, Grade } from "@/types/database";
import Link from "next/link";

interface Alert {
  id: string;
  type: "exam" | "project";
  title: string;
  subject: string;
  daysLeft: number;
  color: string;
}

export default function DashboardPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessionStats, setSessionStats] = useState({ completed: 0, total: 0 });
  const [todaySessions, setTodaySessions] = useState<RevisionSession[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [overallAvg, setOverallAvg] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalChapters: 0,
    completedChapters: 0,
    upcomingExams: 0,
    completedSessions: 0,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notifModal, setNotifModal] = useState<Alert | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [enabledNotifs, setEnabledNotifs] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const first = user.user_metadata?.first_name;
      setUserName(first || user.email?.split("@")[0] || "");
      const savedPhone = user.user_metadata?.phone_number ?? "";
      setPhoneNumber(savedPhone);
      setPhoneInput(savedPhone);
      const savedNotifs: string[] = user.user_metadata?.exam_notifs ?? [];
      setEnabledNotifs(new Set(savedNotifs));
    }
    const today = format(new Date(), "yyyy-MM-dd");

    const [examsRes, allSessionsRes, todaySessionsRes, chaptersRes, projectsRes, gradesRes, subjectsRes] = await Promise.all([
      supabase
        .from("exams")
        .select("*, subject:subjects(*), chapters(*)")
        .gte("exam_date", today)
        .order("exam_date", { ascending: true }),
      supabase
        .from("revision_sessions")
        .select("id, status"),
      supabase
        .from("revision_sessions")
        .select("*, chapter:chapters(*, exam:exams(*, subject:subjects(*)))")
        .eq("scheduled_date", today)
        .order("start_time", { ascending: true }),
      supabase.from("chapters").select("status"),
      supabase
        .from("projects")
        .select("*, subject:subjects(*)")
        .neq("status", "completed")
        .gte("end_date", today)
        .order("end_date", { ascending: true }),
      supabase.from("grades").select("subject_id, grade, max_grade, coefficient"),
      supabase.from("subjects").select("id, ects"),
    ]);

    if (examsRes.data) setExams(examsRes.data);
    if (todaySessionsRes.data) setTodaySessions(todaySessionsRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);

    const allChapters = chaptersRes.data ?? [];
    const allSessionsList = allSessionsRes.data ?? [];
    const completedSessions = allSessionsList.filter((s) => s.status === "completed").length;
    setSessionStats({ completed: completedSessions, total: allSessionsList.length });
    setStats({
      totalExams: examsRes.data?.length ?? 0,
      totalChapters: allChapters.length,
      completedChapters: allChapters.filter((c) => c.status === "completed").length,
      upcomingExams: (examsRes.data ?? []).filter(
        (e) => differenceInDays(parseISO(e.exam_date), new Date()) <= 7
      ).length,
      completedSessions,
      totalSessions: allSessionsList.length,
    });

    if (gradesRes.data && subjectsRes.data) {
      const bySubject = new Map<string, { tw: number; tc: number }>();
      for (const g of gradesRes.data) {
        const entry = bySubject.get(g.subject_id) ?? { tw: 0, tc: 0 };
        entry.tw += (g.grade / g.max_grade) * 20 * g.coefficient;
        entry.tc += g.coefficient;
        bySubject.set(g.subject_id, entry);
      }
      const ectsMap = new Map(subjectsRes.data.map((s) => [s.id, s.ects || 1]));
      let totalW = 0, totalE = 0;
      for (const [id, { tw, tc }] of bySubject) {
        if (tc > 0) {
          const avg = tw / tc;
          const ects = ectsMap.get(id) ?? 1;
          totalW += avg * ects;
          totalE += ects;
        }
      }
      setOverallAvg(totalE > 0 ? totalW / totalE : null);
    }

    const newAlerts: Alert[] = [];
    for (const exam of examsRes.data ?? []) {
      const daysLeft = differenceInDays(parseISO(exam.exam_date), new Date());
      if (daysLeft >= 0 && daysLeft <= 7) {
        newAlerts.push({
          id: exam.id,
          type: "exam",
          title: exam.title,
          subject: exam.subject?.name ?? "",
          daysLeft,
          color: exam.subject?.color ?? "#6366f1",
        });
      }
    }
    for (const project of projectsRes.data ?? []) {
      const daysLeft = differenceInDays(parseISO(project.end_date), new Date());
      if (daysLeft >= 0 && daysLeft <= 7) {
        newAlerts.push({
          id: project.id,
          type: "project",
          title: project.title,
          subject: project.subject?.name ?? "",
          daysLeft,
          color: project.subject?.color ?? "#6366f1",
        });
      }
    }
    newAlerts.sort((a, b) => a.daysLeft - b.daysLeft);
    setAlerts(newAlerts);
    setLoading(false);
  }

  async function savePhone() {
    if (!phoneInput.trim()) return;
    setPhoneSaving(true);
    await supabase.auth.updateUser({
      data: { phone_number: phoneInput.trim() },
    });
    setPhoneNumber(phoneInput.trim());
    setPhoneSaving(false);
  }

  async function toggleNotif(alertId: string) {
    const next = new Set(enabledNotifs);
    if (next.has(alertId)) {
      next.delete(alertId);
    } else {
      next.add(alertId);
    }
    setEnabledNotifs(next);
    await supabase.auth.updateUser({
      data: { exam_notifs: Array.from(next) },
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const progressPercent =
    stats.totalChapters > 0
      ? Math.round((stats.completedChapters / stats.totalChapters) * 100)
      : 0;

  const sessionPercent =
    stats.totalSessions > 0
      ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
      : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const todayDone = todaySessions.filter((s) => s.status === "completed").length;
  const todayPending = todaySessions.filter((s) => s.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 rounded-2xl p-6 md:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold">{greeting}{userName ? `, ${userName}` : ""} 👋</h1>
          <p className="text-muted text-sm mt-1 capitalize">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
          {stats.totalSessions > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 max-w-xs h-2.5 rounded-full bg-white/50 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-700"
                  style={{ width: `${sessionPercent}%` }}
                />
              </div>
              <span className="text-sm font-bold text-primary">{sessionPercent}% révisé</span>
            </div>
          )}
        </div>
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary/5 rounded-full" />
        <div className="absolute -right-4 -bottom-12 w-28 h-28 bg-primary/5 rounded-full" />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const isNotifEnabled = enabledNotifs.has(alert.id);
            return (
              <div
                key={alert.id}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  alert.daysLeft <= 2
                    ? "bg-danger/5 border-danger/20"
                    : "bg-warning/5 border-warning/20"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  alert.daysLeft <= 2 ? "bg-danger/10" : "bg-warning/10"
                }`}>
                  {alert.type === "exam" ? (
                    <AlertTriangle className={`w-5 h-5 ${alert.daysLeft <= 2 ? "text-danger" : "text-warning"}`} />
                  ) : (
                    <FolderOpen className={`w-5 h-5 ${alert.daysLeft <= 2 ? "text-danger" : "text-warning"}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {alert.daysLeft === 0
                      ? `${alert.type === "exam" ? "Examen" : "Date limite"} aujourd'hui !`
                      : `J-${alert.daysLeft} — ${alert.type === "exam" ? "Examen" : "Projet"}`}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {alert.title} · {alert.subject}
                  </p>
                </div>
                <button
                  onClick={() => setNotifModal(alert)}
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    isNotifEnabled
                      ? "bg-primary/10 text-primary"
                      : alert.daysLeft <= 2
                        ? "text-danger/50 hover:text-danger hover:bg-danger/10"
                        : "text-warning/50 hover:text-warning hover:bg-warning/10"
                  }`}
                  title={isNotifEnabled ? "Rappel activé" : "Activer le rappel"}
                >
                  {isNotifEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/exams" className="group bg-card-bg border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BookOpen className="w-4 h-4 text-blue-500" />
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-2xl font-bold mt-3">{stats.totalExams}</p>
          <p className="text-xs text-muted mt-0.5">Examens à venir</p>
        </Link>

        <Link href="/planning" className="group bg-card-bg border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-2xl font-bold mt-3">{stats.upcomingExams}</p>
          <p className="text-xs text-muted mt-0.5">Cette semaine</p>
        </Link>

        <Link href="/planning" className="group bg-card-bg border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Target className="w-4 h-4 text-emerald-500" />
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-2xl font-bold mt-3">{stats.completedChapters}<span className="text-sm text-muted font-normal">/{stats.totalChapters}</span></p>
          <p className="text-xs text-muted mt-0.5">Chapitres révisés</p>
        </Link>

        <Link href="/grades" className="group bg-card-bg border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className={`text-2xl font-bold mt-3 ${
            overallAvg !== null && overallAvg >= 10 ? "text-success" : overallAvg !== null ? "text-danger" : ""
          }`}>
            {overallAvg !== null ? overallAvg.toFixed(1) : "-"}
            <span className="text-sm text-muted font-normal">/20</span>
          </p>
          <p className="text-xs text-muted mt-0.5">Moyenne générale</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's sessions */}
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold">Révisions du jour</h2>
            </div>
            {todaySessions.length > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                {todayDone}/{todaySessions.length}
              </span>
            )}
          </div>

          {todaySessions.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-10 h-10 text-success/30 mx-auto mb-2" />
              <p className="text-sm text-muted">Rien de prévu aujourd&apos;hui !</p>
              <Link href="/planning" className="text-xs text-primary hover:underline mt-1 inline-block">
                Voir le planning
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySessions.map((session) => {
                const isDone = session.status === "completed";
                return (
                  <div
                    key={session.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isDone ? "bg-success/5 opacity-60" : "bg-background"
                    }`}
                  >
                    <div
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: session.chapter?.exam?.subject?.color ?? "#6366f1" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDone ? "line-through" : ""}`}>
                        {session.chapter?.title}
                      </p>
                      <p className="text-xs text-muted">
                        {session.chapter?.exam?.subject?.name} · {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                      </p>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                        {session.method === "first_read" && "1re lecture"}
                        {session.method === "active_review" && "Révision"}
                        {session.method === "spaced_repetition" && "Rép. espacée"}
                        {session.method === "final_review" && "Relecture"}
                      </span>
                    )}
                  </div>
                );
              })}
              <Link
                href="/planning"
                className="block text-center text-xs text-primary hover:underline pt-2"
              >
                Voir le planning complet
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming exams */}
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Prochains examens</h2>
            </div>
            {exams.length > 0 && (
              <span className="text-xs font-medium text-muted">{exams.length} à venir</span>
            )}
          </div>

          {exams.length === 0 ? (
            <div className="text-center py-6">
              <BookOpen className="w-10 h-10 text-muted/30 mx-auto mb-2" />
              <p className="text-sm text-muted">Aucun examen programmé</p>
              <Link href="/exams" className="text-xs text-primary hover:underline mt-1 inline-block">
                Ajouter un examen
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {exams.slice(0, 5).map((exam) => {
                const daysLeft = differenceInDays(parseISO(exam.exam_date), new Date());
                const chapters = exam.chapters ?? [];
                const done = chapters.filter((c) => c.status === "completed").length;
                const chapPct = chapters.length > 0 ? Math.round((done / chapters.length) * 100) : 0;
                return (
                  <div key={exam.id} className="p-3 rounded-lg bg-background">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: exam.subject?.color ?? "#6366f1" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{exam.title}</p>
                        <p className="text-xs text-muted">{exam.subject?.name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        daysLeft <= 1
                          ? "bg-danger/10 text-danger"
                          : daysLeft <= 3
                            ? "bg-warning/10 text-warning"
                            : "bg-primary/10 text-primary"
                      }`}>
                        {daysLeft <= 0 ? "Aujourd'hui" : `J-${daysLeft}`}
                      </span>
                    </div>
                    {chapters.length > 0 && (
                      <div className="mt-2 ml-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-success transition-all"
                            style={{ width: `${chapPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted whitespace-nowrap">{done}/{chapters.length}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <Link
                href="/exams"
                className="block text-center text-xs text-primary hover:underline pt-2"
              >
                Voir tous les examens
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Notification modal */}
      {notifModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setNotifModal(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md animate-fade-in">
            <div className="bg-card-bg border border-border rounded-2xl shadow-xl p-6 mx-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Rappel par SMS</h3>
                </div>
                <button onClick={() => setNotifModal(null)} className="p-1 hover:bg-background rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-background mb-4">
                <p className="text-sm font-medium">{notifModal.title}</p>
                <p className="text-xs text-muted">{notifModal.subject} · J-{notifModal.daysLeft}</p>
              </div>

              {!phoneNumber ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted">
                    Renseigne ton numéro pour recevoir un SMS de rappel avant tes examens.
                    Tu n&apos;auras à le faire qu&apos;une seule fois.
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="06 12 34 56 78"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        await savePhone();
                        await toggleNotif(notifModal.id);
                        setNotifModal(null);
                      }}
                      disabled={phoneSaving || !phoneInput.trim()}
                      className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {phoneSaving ? "..." : "Activer"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{phoneNumber}</span>
                  </div>
                  {enabledNotifs.has(notifModal.id) ? (
                    <button
                      onClick={async () => {
                        await toggleNotif(notifModal.id);
                        setNotifModal(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-muted hover:text-danger hover:border-danger/30 transition-colors"
                    >
                      <BellOff className="w-4 h-4" />
                      Désactiver le rappel
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await toggleNotif(notifModal.id);
                        setNotifModal(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                    >
                      <BellRing className="w-4 h-4" />
                      Activer le rappel
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
