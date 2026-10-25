"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Pencil, FolderOpen } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Project, Subject, ProjectStatus } from "@/types/database";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [projectsRes, subjectsRes] = await Promise.all([
      supabase
        .from("projects")
        .select("*, subject:subjects(*)")
        .order("end_date", { ascending: true }),
      supabase.from("subjects").select("*").order("name"),
    ]);
    if (projectsRes.data) setProjects(projectsRes.data);
    if (subjectsRes.data) setSubjects(subjectsRes.data);
    setLoading(false);
  }

  function startEdit(project: Project) {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description || "");
    setSubjectId(project.subject_id);
    setStartDate(project.start_date);
    setEndDate(project.end_date);
    setShowForm(true);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setSubjectId("");
    setStartDate("");
    setEndDate("");
    setEditingProject(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    if (editingProject) {
      await supabase
        .from("projects")
        .update({
          title,
          description: description || null,
          subject_id: subjectId,
          start_date: startDate,
          end_date: endDate,
        })
        .eq("id", editingProject.id);
    } else {
      await supabase.from("projects").insert({
        user_id: user.id,
        title,
        description: description || null,
        subject_id: subjectId,
        start_date: startDate,
        end_date: endDate,
      });
    }

    resetForm();
    setSaving(false);
    loadData();
  }

  async function deleteProject(id: string) {
    await supabase.from("projects").delete().eq("id", id);
    loadData();
  }

  async function updateStatus(id: string, status: ProjectStatus) {
    await supabase.from("projects").update({ status }).eq("id", id);
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
          <h1 className="text-2xl font-bold">Projets</h1>
          <p className="text-muted text-sm mt-1">
            {projects.length} projet{projects.length !== 1 ? "s" : ""} en cours
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter un projet
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card-bg border border-border rounded-xl p-6 space-y-4"
        >
          <h2 className="font-semibold">
            {editingProject ? "Modifier le projet" : "Nouveau projet"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Titre du projet *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Ex: Rapport IA"
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Date de début *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Date limite *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">
                Description (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Détails, consignes, ressources..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : editingProject ? "Mettre à jour" : "Enregistrer"}
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

      {projects.length === 0 && !showForm ? (
        <div className="bg-card-bg border border-border rounded-xl p-12 text-center">
          <FolderOpen className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-muted">
            Aucun projet pour le moment. Ajoute ton premier projet !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const daysLeft = differenceInDays(
              parseISO(project.end_date),
              new Date()
            );
            const totalDays = differenceInDays(
              parseISO(project.end_date),
              parseISO(project.start_date)
            );
            const elapsed = differenceInDays(
              new Date(),
              parseISO(project.start_date)
            );
            const progressPercent = totalDays > 0
              ? Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)))
              : 100;

            return (
              <div
                key={project.id}
                className="bg-card-bg border border-border rounded-xl p-5 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 mt-1.5"
                    style={{
                      backgroundColor: project.subject?.color ?? "#6366f1",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{project.title}</p>
                      <select
                        value={project.status}
                        onChange={(e) => updateStatus(project.id, e.target.value as ProjectStatus)}
                        className={`text-xs px-2 py-0.5 rounded-full border-0 cursor-pointer ${
                          project.status === "completed"
                            ? "bg-success/10 text-success"
                            : project.status === "in_progress"
                              ? "bg-primary-light text-primary"
                              : "bg-background text-muted"
                        }`}
                      >
                        <option value="not_started">Non commencé</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminé</option>
                      </select>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {project.subject?.name} · Du{" "}
                      {format(parseISO(project.start_date), "d MMM", { locale: fr })} au{" "}
                      {format(parseISO(project.end_date), "d MMM yyyy", { locale: fr })}
                    </p>
                    {project.description && (
                      <p className="text-sm text-muted mt-2">{project.description}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                      daysLeft <= 2
                        ? "bg-danger/10 text-danger"
                        : daysLeft <= 5
                          ? "bg-warning/10 text-warning"
                          : "bg-primary-light text-primary"
                    }`}
                  >
                    {daysLeft <= 0 ? "Échéance dépassée" : `J-${daysLeft}`}
                  </span>
                </div>

                {project.status !== "completed" && (
                  <div>
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>Progression temporelle</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progressPercent >= 80 ? "bg-danger" : progressPercent >= 50 ? "bg-warning" : "bg-primary"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <button
                    onClick={() => startEdit(project)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="flex items-center gap-1.5 text-xs text-danger hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
