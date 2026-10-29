import { NextRequest, NextResponse } from "next/server";
import ical from "node-ical";

interface ParsedSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  label: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL manquante" },
        { status: 400 }
      );
    }

    let events;
    try {
      events = await ical.async.fromURL(url);
    } catch (fetchErr: unknown) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      if (msg.includes("500") || msg.includes("Internal Server")) {
        return NextResponse.json(
          { error: "Le serveur du calendrier a renvoyé une erreur. Vérifie que l'URL est complète (avec le bon identifiant de groupe/formation)." },
          { status: 422 }
        );
      }
      throw fetchErr;
    }
    const slotsMap = new Map<string, ParsedSlot>();

    for (const key of Object.keys(events)) {
      const event = events[key];
      if (!event || event.type !== "VEVENT") continue;
      if (!("start" in event) || !("end" in event) || !event.start || !event.end) continue;

      const start = new Date(event.start as unknown as string);
      const end = new Date(event.end as unknown as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

      const jsDay = start.getDay();
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

      const startTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
      const endTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;

      if (startTime === endTime) continue;

      const summary = (("summary" in event && event.summary) ? String(event.summary).trim() : "Cours");
      const slotKey = `${dayOfWeek}-${startTime}-${endTime}-${summary}`;

      if (!slotsMap.has(slotKey)) {
        slotsMap.set(slotKey, {
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          label: summary,
        });
      }
    }

    const slots = Array.from(slotsMap.values()).sort(
      (a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)
    );

    return NextResponse.json({ slots, count: slots.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Impossible de lire le calendrier : ${message}` },
      { status: 500 }
    );
  }
}
