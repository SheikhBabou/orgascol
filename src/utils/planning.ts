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

const DAY_START = 8 * 60; // 08:00
const DAY_END = 22 * 60;  // 22:00
const MIN_SLOT = 60;       // minimum 1h pour une session
const MAX_SLOT = 120;      // maximum 2h par session

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
    const dayOfWeek = (current.getDay() + 6) % 7; // 0=Mon
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

    let cursor = DAY_START;
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

    if (DAY_END > cursor) {
      const gap = DAY_END - cursor;
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
          const secondDuration = Math.min(DAY_END - secondStart, MAX_SLOT);
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

export function generatePlanning(
  exams: ExamWithDetails[],
  scheduleSlots: ScheduleSlot[]
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
  }[] = [];

  for (const exam of upcomingExams) {
    const daysLeft = differenceInDays(parseISO(exam.exam_date), today);
    const chapters = (exam.chapters ?? []).filter(
      (c) => c.status !== "completed"
    );
    for (const chapter of chapters) {
      chaptersToSchedule.push({
        chapter,
        exam,
        urgency: chapters.length / Math.max(daysLeft, 1),
      });
    }
  }

  chaptersToSchedule.sort((a, b) => b.urgency - a.urgency);

  const sessions: GeneratedSession[] = [];
  const usedSlots = new Set<string>();
  const chapterSessionCount = new Map<string, number>();

  for (const { chapter, exam } of chaptersToSchedule) {
    const examDate = parseISO(exam.exam_date);
    const daysLeft = differenceInDays(examDate, today);
    const sessionsNeeded = Math.min(Math.max(Math.ceil(daysLeft / 3), 1), 4);

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
