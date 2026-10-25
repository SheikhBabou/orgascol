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
  FolderOpen,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Exam, RevisionSession, Project } from "@/types/database";

interface Alert {
  type: "exam" | "project";
  title: string;
  subject: string;
  daysLeft: number;
  color: string;
}

export default function DashboardPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [todaySessions, setTodaySessions] = useState<RevisionSession[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalChapters: 0,
    completedChapters: 0,
    upcomingExams: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const today = format(new Date(), "yyyy-MM-dd");

    const [examsRes, sessionsRes, chaptersRes, projectsRes] = await Promise.all([
      supabase
        .from("exams")
        .select("*, subject:subjects(*), chapters(*)")
        .gte("exam_date", today)
        .order("exam_date", { ascending: true }),
      supabase
        .from("revision_sessions")
        .select(
          "*, chapter:chapters(*, exam:exams(*, subject:subjects(*)))"
        )
        .eq("scheduled_date", today)
        .eq("status", "pending")
        .order("start_time", { ascending: true })
        .limit(3),
      supabase.from("chapters").select("status"),
      supabase
        .from("projects")
        .select("*, subject:subjects(*)")
        .neq("status", "completed")
        .gte("end_date", today)
        .order("end_date", { ascending: true }),
    ]);

    if (examsRes.data) setExams(examsRes.data);
    if (sessionsRes.data) setTodaySessions(sessionsRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);

    const allChapters = chaptersRes.data ?? [];
    setStats({
      totalExams: examsRes.data?.length ?? 0,
      totalChapters: allChapters.length,
      completedChapters: allChapters.filter((c) => c.status === "completed")
        .length,
      upcomingExams: (examsRes.data ?? []).filter(
        (e) => differenceInDays(parseISO(e.exam_date), new Date()) <= 7
      ).length,
    });

    const newAlerts: Alert[] = [];

    for (const exam of examsRes.data ?? []) {
      const daysLeft = differenceInDays(parseISO(exam.exam_date), new Date());
      if (daysLeft >= 0 && daysLeft <= 5) {
        newAlerts.push({
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
      if (daysLeft >= 0 && daysLeft <= 5) {
        newAlerts.push({
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted text-sm mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl border ${
                alert.daysLeft <= 2
                  ? "bg-danger/5 border-danger/20"
                  : "bg-warning/5 border-warning/20"
              }`}
            >
              <div className={`p-2 rounded-lg ${
                alert.daysLeft <= 2 ? "bg-danger/10" : "bg-warning/10"
              }`}>
                {alert.type === "exam" ? (
                  <AlertTriangle className={`w-5 h-5 ${alert.daysLeft <= 2 ? "text-danger" : "text-warning"}`} />
                ) : (
                  <FolderOpen className={`w-5 h-5 ${alert.daysLeft <= 2 ? "text-danger" : "text-warning"}`} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {alert.daysLeft === 0
                    ? `${alert.type === "exam" ? "Examen" : "Date limite"} aujourd'hui !`
                    : `Plus que ${alert.daysLeft} jour${alert.daysLeft > 1 ? "s" : ""} avant ${
                        alert.type === "exam" ? "l'examen" : "la date limite du projet"
                      }`}
                </p>
                <p className="text-xs text-muted">
                  {alert.title} · {alert.subject}
                </p>
              </div>
              <Bell className={`w-4 h-4 ${alert.daysLeft <= 2 ? "text-danger" : "text-warning"}`} />
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <div className="bg-card-bg border border-border rounded-xl p-4 card-interactive">
          <div className="flex items-center gap-2 text-muted text-sm">
            <BookOpen className="w-4 h-4" />
            Examens à venir
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalExams}</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-4 card-interactive">
          <div className="flex items-center gap-2 text-muted text-sm">
            <Clock className="w-4 h-4" />
            Cette semaine
          </div>
          <p className="text-2xl font-bold mt-1">{stats.upcomingExams}</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-4 card-interactive">
          <div className="flex items-center gap-2 text-muted text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Chapitres révisés
          </div>
          <p className="text-2xl font-bold mt-1">
            {stats.completedChapters}/{stats.totalChapters}
          </p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-4 card-interactive">
          <div className="flex items-center gap-2 text-muted text-sm">
            <TrendingUp className="w-4 h-4" />
            Progression
          </div>
          <p className="text-2xl font-bold mt-1">{progressPercent}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
        {/* Today's sessions */}
        <div className="bg-card-bg border border-border rounded-xl p-6 card-interactive">
          <h2 className="font-semibold text-lg mb-4">
            Révisions du jour
          </h2>
          {todaySessions.length === 0 ? (
            <p className="text-muted text-sm">
              Aucune révision prévue aujourd&apos;hui. Ajoute des examens et
              génère ton planning !
            </p>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        session.chapter?.exam?.subject?.color ?? "#6366f1",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.chapter?.title}
                    </p>
                    <p className="text-xs text-muted">
                      {session.chapter?.exam?.subject?.name} &middot;{" "}
                      {session.start_time.slice(0, 5)} -{" "}
                      {session.end_time.slice(0, 5)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary-light text-primary">
                    {session.method === "first_read" && "1re lecture"}
                    {session.method === "active_review" && "Révision active"}
                    {session.method === "spaced_repetition" && "Rép. espacée"}
                    {session.method === "final_review" && "Relecture finale"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming exams */}
        <div className="bg-card-bg border border-border rounded-xl p-6 card-interactive">
          <h2 className="font-semibold text-lg mb-4">Prochains examens</h2>
          {exams.length === 0 ? (
            <p className="text-muted text-sm">
              Aucun examen programmé. Commence par en ajouter un !
            </p>
          ) : (
            <div className="space-y-3">
              {exams.slice(0, 5).map((exam) => {
                const daysLeft = differenceInDays(
                  parseISO(exam.exam_date),
                  new Date()
                );
                const chapters = exam.chapters ?? [];
                const done = chapters.filter(
                  (c) => c.status === "completed"
                ).length;
                return (
                  <div
                    key={exam.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: exam.subject?.color ?? "#6366f1",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {exam.title}
                      </p>
                      <p className="text-xs text-muted">
                        {exam.subject?.name} &middot; {done}/{chapters.length}{" "}
                        chapitres
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        daysLeft <= 2
                          ? "bg-danger/10 text-danger"
                          : daysLeft <= 5
                            ? "bg-warning/10 text-warning"
                            : "bg-primary-light text-primary"
                      }`}
                    >
                      {daysLeft <= 0 ? (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Aujourd&apos;hui
                        </span>
                      ) : (
                        `J-${daysLeft}`
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
