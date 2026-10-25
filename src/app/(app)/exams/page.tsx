"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Pencil, X } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Exam, Subject, ChapterStatus } from "@/types/database";
import ConfirmDialog from "@/components/confirm-dialog";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [teacher, setTeacher] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapters, setChapters] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  const [newChapter, setNewChapter] = useState("");
  const [addingChapterTo, setAddingChapterTo] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "exam" | "chapter"; id: string; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [examsRes, subjectsRes] = await Promise.all([
      supabase
        .from("exams")
        .select("*, subject:subjects(*), chapters(*)")
        .order("exam_date", { ascending: true }),
      supabase.from("subjects").select("*").order("name"),
    ]);
    if (examsRes.data) setExams(examsRes.data);
    if (subjectsRes.data) setSubjects(subjectsRes.data);
    setLoading(false);
  }

  function startEdit(exam: Exam) {
    setEditingExam(exam);
    setTitle(exam.title);
    setExamDate(exam.exam_date);
    setTeacher(exam.teacher || "");
    setSubjectId(exam.subject_id);
    setChapters([""]);
    setShowForm(true);
  }

  function resetForm() {
    setTitle("");
    setExamDate("");
    setTeacher("");
    setSubjectId("");
    setChapters([""]);
    setEditingExam(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    if (!subjectId) { setSaving(false); return; }

    if (editingExam) {
      await supabase
        .from("exams")
        .update({
          title,
          exam_date: examDate,
          teacher: teacher || null,
          subject_id: subjectId,
        })
        .eq("id", editingExam.id);

      const validChapters = chapters.filter((c) => c.trim());
      if (validChapters.length > 0) {
        const maxPos = (editingExam.chapters ?? []).reduce((max, c) => Math.max(max, c.position), -1);
        await supabase.from("chapters").insert(
          validChapters.map((c, i) => ({
            exam_id: editingExam.id,
            title: c.trim(),
            position: maxPos + 1 + i,
          }))
        );
      }
    } else {
      const { data: exam, error } = await supabase
        .from("exams")
        .insert({
          title,
          exam_date: examDate,
          teacher: teacher || null,
          subject_id: subjectId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur création examen:", error);
        setSaving(false);
        return;
      }

      if (exam) {
        const validChapters = chapters.filter((c) => c.trim());
        if (validChapters.length > 0) {
          await supabase.from("chapters").insert(
            validChapters.map((c, i) => ({
              exam_id: exam.id,
              title: c.trim(),
              position: i,
            }))
          );
        }
      }
    }

    resetForm();
    setSaving(false);
    loadData();
  }

  async function addChapterToExam(examId: string) {
    if (!newChapter.trim()) return;
    const exam = exams.find((e) => e.id === examId);
    const maxPos = (exam?.chapters ?? []).reduce((max, c) => Math.max(max, c.position), -1);
    await supabase.from("chapters").insert({
      exam_id: examId,
      title: newChapter.trim(),
      position: maxPos + 1,
    });
    setNewChapter("");
    setAddingChapterTo(null);
    loadData();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "exam") {
      await supabase.from("exams").delete().eq("id", deleteTarget.id);
    } else {
      await supabase.from("chapters").delete().eq("id", deleteTarget.id);
    }
    setDeleteTarget(null);
    loadData();
  }

  async function toggleChapterStatus(
    chapterId: string,
    currentStatus: ChapterStatus
  ) {
    const next: ChapterStatus =
      currentStatus === "completed" ? "not_started" : "completed";
    await supabase
      .from("chapters")
      .update({ status: next })
      .eq("id", chapterId);
    loadData();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Examens</h1>
          <p className="text-muted text-sm mt-1">
            {exams.length} examen{exams.length !== 1 ? "s" : ""} programmé
            {exams.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter un examen
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card-bg border border-border rounded-xl p-6 space-y-4"
        >
          <h2 className="font-semibold">
            {editingExam ? "Modifier l'examen" : "Nouvel examen"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Titre de l&apos;examen *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Ex: CC Séries temporelles"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Date de l&apos;examen *
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Matière *
              </label>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Choisir une matière</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {subjects.length === 0 && (
                <p className="text-xs text-warning mt-1">
                  Aucune matière. Va dans &quot;Matières&quot; pour en ajouter.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Professeur (optionnel)
              </label>
              <input
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Ex: M. Gouno"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {editingExam ? "Ajouter des chapitres" : "Chapitres à réviser"}
            </label>
            <div className="space-y-2">
              {chapters.map((ch, i) => (
                <div key={i} className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted" />
                  <input
                    value={ch}
                    onChange={(e) => {
                      const updated = [...chapters];
                      updated[i] = e.target.value;
                      setChapters(updated);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={`Chapitre ${i + 1}`}
                  />
                  {chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setChapters(chapters.filter((_, j) => j !== i))
                      }
                      className="p-1.5 text-muted hover:text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setChapters([...chapters, ""])}
              className="mt-2 text-sm text-primary hover:underline"
            >
              + Ajouter un chapitre
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : editingExam ? "Mettre à jour" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-border rounded-lg text-sm hover:bg-background transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {exams.length === 0 && !showForm ? (
        <div className="bg-card-bg border border-border rounded-xl p-12 text-center">
          <p className="text-muted">
            Aucun examen pour le moment. Commence par en ajouter un !
          </p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {exams.map((exam) => {
            const daysLeft = differenceInDays(
              parseISO(exam.exam_date),
              new Date()
            );
            const chaptersList = exam.chapters ?? [];
            const done = chaptersList.filter(
              (c) => c.status === "completed"
            ).length;
            const isExpanded = expandedExam === exam.id;

            return (
              <div
                key={exam.id}
                className="bg-card-bg border border-border rounded-xl overflow-hidden card-interactive"
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-background/50 transition-colors"
                  onClick={() =>
                    setExpandedExam(isExpanded ? null : exam.id)
                  }
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: exam.subject?.color ?? "#6366f1",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{exam.title}</p>
                    <p className="text-xs text-muted">
                      {exam.subject?.name}
                      {exam.teacher && ` · ${exam.teacher}`} ·{" "}
                      {format(parseISO(exam.exam_date), "d MMMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted">
                      {done}/{chaptersList.length} chapitres
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        daysLeft <= 2
                          ? "bg-danger/10 text-danger"
                          : daysLeft <= 5
                            ? "bg-warning/10 text-warning"
                            : "bg-primary-light text-primary"
                      }`}
                    >
                      {daysLeft <= 0 ? "Aujourd'hui" : `J-${daysLeft}`}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-2">
                    {chaptersList.length === 0 ? (
                      <p className="text-sm text-muted">
                        Aucun chapitre ajouté.
                      </p>
                    ) : (
                      chaptersList
                        .sort((a, b) => a.position - b.position)
                        .map((ch) => (
                          <div
                            key={ch.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-background group"
                          >
                            <input
                              type="checkbox"
                              checked={ch.status === "completed"}
                              onChange={() =>
                                toggleChapterStatus(ch.id, ch.status)
                              }
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                            />
                            <span
                              className={`flex-1 text-sm ${
                                ch.status === "completed"
                                  ? "line-through text-muted"
                                  : ""
                              }`}
                            >
                              {ch.title}
                            </span>
                            <button
                              onClick={() => setDeleteTarget({ type: "chapter", id: ch.id, name: ch.title })}
                              className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-danger transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                    )}

                    {addingChapterTo === exam.id ? (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          autoFocus
                          value={newChapter}
                          onChange={(e) => setNewChapter(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); addChapterToExam(exam.id); }
                            if (e.key === "Escape") { setAddingChapterTo(null); setNewChapter(""); }
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Nom du chapitre"
                        />
                        <button
                          onClick={() => addChapterToExam(exam.id)}
                          className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover"
                        >
                          Ajouter
                        </button>
                        <button
                          onClick={() => { setAddingChapterTo(null); setNewChapter(""); }}
                          className="p-2 text-muted hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingChapterTo(exam.id)}
                        className="text-sm text-primary hover:underline pt-1"
                      >
                        + Ajouter un chapitre
                      </button>
                    )}

                    <div className="pt-2 border-t border-border flex items-center gap-4">
                      <button
                        onClick={() => startEdit(exam)}
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Modifier
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: "exam", id: exam.id, name: exam.title })}
                        className="flex items-center gap-1.5 text-xs text-danger hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteTarget?.type === "exam" ? "Supprimer l'examen ?" : "Supprimer le chapitre ?"}
        message={`"${deleteTarget?.name ?? ""}" sera supprimé définitivement${deleteTarget?.type === "exam" ? " ainsi que tous ses chapitres" : ""}.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
