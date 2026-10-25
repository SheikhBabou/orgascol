export type ChapterStatus = "not_started" | "in_progress" | "completed";
export type SlotType = "class" | "busy" | "revision";
export type RevisionMethod =
  | "first_read"
  | "active_review"
  | "spaced_repetition"
  | "final_review";
export type SessionStatus = "pending" | "completed" | "skipped";

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  ue_name: string | null;
  ects: number;
  created_at: string;
}

export interface Grade {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  grade: number;
  max_grade: number;
  coefficient: number;
  created_at: string;
  subject?: Subject;
}

export type ProjectStatus = "not_started" | "in_progress" | "completed";

export interface Project {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  created_at: string;
  subject?: Subject;
}

export interface Exam {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  exam_date: string;
  teacher: string | null;
  created_at: string;
  subject?: Subject;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  exam_id: string;
  title: string;
  status: ChapterStatus;
  position: number;
  notes: string | null;
  created_at: string;
}

export interface ScheduleSlot {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  label: string | null;
  slot_type: SlotType;
  created_at: string;
}

export interface RevisionSession {
  id: string;
  user_id: string;
  chapter_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  method: RevisionMethod;
  status: SessionStatus;
  created_at: string;
  chapter?: Chapter & { exam?: Exam & { subject?: Subject } };
}
