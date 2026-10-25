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

function getAvailableSlots(
  scheduleSlots: ScheduleSlot[],
  startDate: Date,
  endDate: Date
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  let current = startDate;

  while (isBefore(current, endDate) || isEqual(current, endDate)) {
    const dayOfWeek = (current.getDay() + 6) % 7; // 0=Mon

    const revisionSlots = scheduleSlots.filter(
      (s) => s.day_of_week === dayOfWeek && s.slot_type === "revision"
    );

    if (revisionSlots.length > 0) {
      for (const rs of revisionSlots) {
        const [sh, sm] = rs.start_time.split(":").map(Number);
        const [eh, em] = rs.end_time.split(":").map(Number);
        const duration = (eh * 60 + em) - (sh * 60 + sm);
        if (duration > 0) {
          slots.push({
            date: format(current, "yyyy-MM-dd"),
            start_time: rs.start_time.slice(0, 5),
            end_time: rs.end_time.slice(0, 5),
            duration_minutes: duration,
          });
        }
      }
    } else {
      const busySlots = scheduleSlots.filter(
        (s) => s.day_of_week === dayOfWeek && s.slot_type !== "revision"
      );

      const defaultRevisionSlots = [
        { start: "18:00", end: "19:30" },
        { start: "20:00", end: "21:00" },
      ];

      for (const def of defaultRevisionSlots) {
        const overlaps = busySlots.some((b) => {
          const bStart = b.start_time.slice(0, 5);
          const bEnd = b.end_time.slice(0, 5);
          return bStart < def.end && bEnd > def.start;
        });

        if (!overlaps) {
          const [sh, sm] = def.start.split(":").map(Number);
          const [eh, em] = def.end.split(":").map(Number);
          slots.push({
            date: format(current, "yyyy-MM-dd"),
            start_time: def.start,
            end_time: def.end,
            duration_minutes: (eh * 60 + em) - (sh * 60 + sm),
          });
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
