import {
  addDays,
  differenceInDays,
  format,
  parseISO,
  isBefore,
  isEqual,
} from "date-fns";
import type {
  Chapter,
  Exam,
  ScheduleSlot,
  RevisionMethod,
  Subject,
} from "@/types/database";

interface ExamWithDetails extends Exam {
  subject?: Subject;
  chapters?: Chapter[];
}

interface GeneratedSession {
  chapter_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  method: RevisionMethod;
}

interface AvailableSlot {
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

const DAY_START = 8 * 60;
const DAY_END = 22 * 60;
const MIN_SLOT = 60;
const MAX_SLOT = 120;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getAvailableSlots(
  scheduleSlots: ScheduleSlot[],
  startDate: Date,
  endDate: Date
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  let current = startDate;

  while (isBefore(current, endDate) || isEqual(current, endDate)) {
    const dayOfWeek = (current.getDay() + 6) % 7;
    const dateStr = format(current, "yyyy-MM-dd");

    const classSlots = scheduleSlots
      .filter((s) => s.day_of_week === dayOfWeek)
      .map((s) => ({
        start: toMinutes(s.start_time),
        end: toMinutes(s.end_time),
      }))
      .sort((a, b) => a.start - b.start);

    const occupied = classSlots.reduce<{ start: number; end: number }[]>(
      (merged, slot) => {
        if (merged.length > 0 && slot.start <= merged[merged.length - 1].end) {
          merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, slot.end);
        } else {
          merged.push({ ...slot });
        }
        return merged;
      },
      []
    );

    const isSunday = dayOfWeek === 6;
    const dayStart = isSunday ? 19 * 60 : DAY_START;
    const dayEnd = isSunday ? 22 * 60 : DAY_END;

    let cursor = dayStart;
    for (const block of occupied) {
      if (block.start > cursor) {
        const gap = block.start - cursor;
        if (gap >= MIN_SLOT) {
          const duration = Math.min(gap, MAX_SLOT);
          slots.push({
            date: dateStr,
            start_time: fromMinutes(cursor),
            end_time: fromMinutes(cursor + duration),
            duration_minutes: duration,
          });
        }
      }
      cursor = Math.max(cursor, block.end);
    }

    if (dayEnd > cursor) {
      const gap = dayEnd - cursor;
      if (gap >= MIN_SLOT) {
        const duration = Math.min(gap, MAX_SLOT);
        slots.push({
          date: dateStr,
          start_time: fromMinutes(cursor),
          end_time: fromMinutes(cursor + duration),
          duration_minutes: duration,
        });
        if (gap > MAX_SLOT + MIN_SLOT) {
          const secondStart = cursor + MAX_SLOT + 15;
          const secondDuration = Math.min(dayEnd - secondStart, MAX_SLOT);
          if (secondDuration >= MIN_SLOT) {
            slots.push({
              date: dateStr,
              start_time: fromMinutes(secondStart),
              end_time: fromMinutes(secondStart + secondDuration),
              duration_minutes: secondDuration,
            });
          }
        }
      }
    }

    current = addDays(current, 1);
  }

  return slots;
}

function assignMethod(
  sessionIndex: number,
  totalSessions: number,
  daysUntilExam: number
): RevisionMethod {
  if (sessionIndex === 0) return "first_read";
  if (daysUntilExam <= 1) return "final_review";
  if (totalSessions >= 3 && sessionIndex >= 2) return "spaced_repetition";
  return "active_review";
}

// avg 18 → 0.6 (bon, moins de sessions mais pas zéro)
// avg 10 → 1.0 (normal)
// avg 5  → 1.5 (en difficulté, plus de sessions)
// avg 0  → 2.0 (urgence maximale)
// pas de notes → 1.0
function gradeWeight(subjectAvg: number | undefined): number {
  if (subjectAvg === undefined) return 1;
  return Math.max(0.5, Math.min(2, 1 + (10 - subjectAvg) * 0.1));
}

export function generatePlanning(
  exams: ExamWithDetails[],
  scheduleSlots: ScheduleSlot[],
  subjectAverages?: Map<string, number>
): GeneratedSession[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingExams = exams
    .filter((e) => {
      const examDate = parseISO(e.exam_date);
      return isBefore(today, examDate) || isEqual(today, examDate);
    })
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date));

  if (upcomingExams.length === 0) return [];

  const lastExamDate = parseISO(
    upcomingExams[upcomingExams.length - 1].exam_date
  );
  const availableSlots = getAvailableSlots(
    scheduleSlots,
    addDays(today, 1),
    lastExamDate
  );

  const chaptersToSchedule: {
    chapter: Chapter;
    exam: ExamWithDetails;
    urgency: number;
    weight: number;
  }[] = [];

  for (const exam of upcomingExams) {
    const daysLeft = differenceInDays(parseISO(exam.exam_date), today);
    const chapters = (exam.chapters ?? []).filter(
      (c) => c.status !== "completed"
    );
    const weight = gradeWeight(subjectAverages?.get(exam.subject_id));

    for (const chapter of chapters) {
      chaptersToSchedule.push({
        chapter,
        exam,
        urgency: (chapters.length / Math.max(daysLeft, 1)) * weight,
        weight,
      });
    }
  }

  chaptersToSchedule.sort((a, b) => b.urgency - a.urgency);

  const sessions: GeneratedSession[] = [];
  const usedSlots = new Set<string>();
  const chapterSessionCount = new Map<string, number>();

  for (const { chapter, exam, weight } of chaptersToSchedule) {
    const examDate = parseISO(exam.exam_date);
    const daysLeft = differenceInDays(examDate, today);
    const baseSessions = Math.min(Math.max(Math.ceil(daysLeft / 3), 1), 4);
    const sessionsNeeded = Math.min(Math.round(baseSessions * weight), 6);

    let scheduled = 0;

    const idealSpacing = Math.max(
      Math.floor(daysLeft / (sessionsNeeded + 1)),
      1
    );

    for (let i = 0; i < sessionsNeeded && scheduled < sessionsNeeded; i++) {
      const targetDate = format(
        addDays(today, Math.min(1 + i * idealSpacing, daysLeft)),
        "yyyy-MM-dd"
      );

      const slot = availableSlots.find((s) => {
        const slotKey = `${s.date}-${s.start_time}`;
        return (
          !usedSlots.has(slotKey) &&
          s.date >= targetDate &&
          s.date < exam.exam_date
        );
      });

      if (slot) {
        const slotKey = `${slot.date}-${slot.start_time}`;
        usedSlots.add(slotKey);

        const count = chapterSessionCount.get(chapter.id) ?? 0;
        chapterSessionCount.set(chapter.id, count + 1);

        const daysUntilExam = differenceInDays(
          examDate,
          parseISO(slot.date)
        );

        sessions.push({
          chapter_id: chapter.id,
          scheduled_date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          method: assignMethod(count, sessionsNeeded, daysUntilExam),
        });

        scheduled++;
      }
    }
  }

  sessions.sort((a, b) => {
    const dateComp = a.scheduled_date.localeCompare(b.scheduled_date);
    if (dateComp !== 0) return dateComp;
    return a.start_time.localeCompare(b.start_time);
  });

  return sessions;
}
