"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import type { Subject, Grade } from "@/types/database";

export default function GradesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  const [subjectId, setSubjectId] = useState("");
  const [gradeTitle, setGradeTitle] = useState("");
  const [gradeValue, setGradeValue] = useState("");
  const [maxGrade, setMaxGrade] = useState("20");
  const [coefficient, setCoefficient] = useState("1");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [subjectsRes, gradesRes] = await Promise.all([
      supabase.from("subjects").select("*").order("ue_name").order("name"),
      supabase.from("grades").select("*, subject:subjects(*)").order("created_at", { ascending: false }),
    ]);
    if (subjectsRes.data) setSubjects(subjectsRes.data);
    if (gradesRes.data) setGrades(gradesRes.data);
    setLoading(false);
  }

  async function handleAddGrade(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from("grades").insert({
      user_id: user.id,
      subject_id: subjectId,
      title: gradeTitle,
      grade: parseFloat(gradeValue),
      max_grade: parseFloat(maxGrade),
      coefficient: parseFloat(coefficient),
    });

    setGradeTitle("");
    setGradeValue("");
    setMaxGrade("20");
    setCoefficient("1");
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  async function deleteGrade(id: string) {
    await supabase.from("grades").delete().eq("id", id);
    loadData();
  }

  function getSubjectAverage(subjectId: string): number | null {
    const subjectGrades = grades.filter((g) => g.subject_id === subjectId);
    if (subjectGrades.length === 0) return null;
    let totalWeighted = 0;
    let totalCoeff = 0;
    for (const g of subjectGrades) {
      const normalized = (g.grade / g.max_grade) * 20;
      totalWeighted += normalized * g.coefficient;
      totalCoeff += g.coefficient;
    }
    return totalCoeff > 0 ? totalWeighted / totalCoeff : null;
  }

  function getUEAverage(ueName: string): number | null {
    const ueSubjects = subjects.filter((s) => s.ue_name === ueName);
    const averages: { avg: number; ects: number }[] = [];
    for (const s of ueSubjects) {
      const avg = getSubjectAverage(s.id);
      if (avg !== null) {
        averages.push({ avg, ects: s.ects || 1 });
      }
    }
    if (averages.length === 0) return null;
    const totalWeighted = averages.reduce((sum, a) => sum + a.avg * a.ects, 0);
    const totalEcts = averages.reduce((sum, a) => sum + a.ects, 0);
    return totalEcts > 0 ? totalWeighted / totalEcts : null;
  }

  function getOverallAverage(): number | null {
    const averages: { avg: number; ects: number }[] = [];
    for (const s of subjects) {
      const avg = getSubjectAverage(s.id);
      if (avg !== null) {
        averages.push({ avg, ects: s.ects || 1 });
      }
    }
    if (averages.length === 0) return null;
    const totalWeighted = averages.reduce((sum, a) => sum + a.avg * a.ects, 0);
    const totalEcts = averages.reduce((sum, a) => sum + a.ects, 0);
    return totalEcts > 0 ? totalWeighted / totalEcts : null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const overallAvg = getOverallAverage();
  const ueNames = [...new Set(subjects.map((s) => s.ue_name).filter(Boolean))] as string[];
  const subjectsWithoutUE = subjects.filter((s) => !s.ue_name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes & Moyennes</h1>
          <p className="text-muted text-sm mt-1">
            Ajoute tes notes et calcule tes moyennes par matière et par UE
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter une note
        </button>
      </div>

      {/* Overall average */}
      <div className="bg-card-bg border border-border rounded-xl p-6 text-center">
        <p className="text-sm text-muted">Moyenne générale</p>
        <p className={`text-4xl font-bold mt-1 ${
          overallAvg !== null && overallAvg >= 10 ? "text-success" : overallAvg !== null ? "text-danger" : "text-muted"
        }`}>
          {overallAvg !== null ? overallAvg.toFixed(2) : "—"} <span className="text-lg text-muted font-normal">/20</span>
        </p>
      </div>

      {/* Add grade form */}
      {showForm && (
        <form
          onSubmit={handleAddGrade}
          className="bg-card-bg border border-border rounded-xl p-6 space-y-4"
        >
          <h2 className="font-semibold">Nouvelle note</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Matière *</label>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Choisir une matière</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ue_name ? `${s.ue_name} — ` : ""}{s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Intitulé *
              </label>
              <input
                required
                value={gradeTitle}
                onChange={(e) => setGradeTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Ex: CC1, Exam final, TP2..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Note *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="14.5"
                />
                <span className="text-muted">/</span>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="1"
                  value={maxGrade}
                  onChange={(e) => setMaxGrade(e.target.value)}
                  className="w-20 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Coefficient
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={coefficient}
                onChange={(e) => setCoefficient(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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

      {/* UE sections */}
      {ueNames.map((ueName) => {
        const ueAvg = getUEAverage(ueName);
        const ueSubjects = subjects.filter((s) => s.ue_name === ueName);
        return (
          <div key={ueName} className="bg-card-bg border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background/50">
              <h2 className="font-semibold">{ueName}</h2>
              <span className={`text-sm font-bold ${
                ueAvg !== null && ueAvg >= 10 ? "text-success" : ueAvg !== null ? "text-danger" : "text-muted"
              }`}>
                {ueAvg !== null ? ueAvg.toFixed(2) : "—"}/20
              </span>
            </div>
            <div className="divide-y divide-border">
              {ueSubjects.map((subject) => {
                const subjectGrades = grades.filter((g) => g.subject_id === subject.id);
                const avg = getSubjectAverage(subject.id);
                return (
                  <div key={subject.id} className="px-6 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                        <span className="text-sm font-medium">{subject.name}</span>
                        {subject.ects > 0 && (
                          <span className="text-xs text-muted">({subject.ects} ECTS)</span>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${
                        avg !== null && avg >= 10 ? "text-success" : avg !== null ? "text-danger" : "text-muted"
                      }`}>
                        {avg !== null ? avg.toFixed(2) : "—"}/20
                      </span>
                    </div>
                    {subjectGrades.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {subjectGrades.map((g) => (
                          <div key={g.id} className="flex items-center justify-between text-xs text-muted">
                            <span>{g.title} (coeff {g.coefficient})</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {g.grade}/{g.max_grade}
                              </span>
                              <button
                                onClick={() => deleteGrade(g.id)}
                                className="opacity-50 hover:opacity-100 text-danger"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Subjects without UE */}
      {subjectsWithoutUE.length > 0 && (
        <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-background/50">
            <h2 className="font-semibold">Autres matières</h2>
          </div>
          <div className="divide-y divide-border">
            {subjectsWithoutUE.map((subject) => {
              const subjectGrades = grades.filter((g) => g.subject_id === subject.id);
              const avg = getSubjectAverage(subject.id);
              return (
                <div key={subject.id} className="px-6 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                      <span className="text-sm font-medium">{subject.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      avg !== null && avg >= 10 ? "text-success" : avg !== null ? "text-danger" : "text-muted"
                    }`}>
                      {avg !== null ? avg.toFixed(2) : "—"}/20
                    </span>
                  </div>
                  {subjectGrades.length > 0 && (
                    <div className="ml-4 space-y-1">
                      {subjectGrades.map((g) => (
                        <div key={g.id} className="flex items-center justify-between text-xs text-muted">
                          <span>{g.title} (coeff {g.coefficient})</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {g.grade}/{g.max_grade}
                            </span>
                            <button
                              onClick={() => deleteGrade(g.id)}
                              className="opacity-50 hover:opacity-100 text-danger"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subjects.length === 0 && (
        <div className="bg-card-bg border border-border rounded-xl p-12 text-center">
          <p className="text-muted">
            Ajoute des matières d&apos;abord dans l&apos;onglet &quot;Matières&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
