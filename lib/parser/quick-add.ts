import { addDays, nextDay, parse, set, startOfDay } from "date-fns";

export type Priority = "none" | "low" | "medium" | "high" | "urgent";

export interface ParsedTask {
  title: string;
  dueDate: Date | null;
  priority: Priority;
  tags: string[];
  projectName: string | null;
}

const PRIORITY_MAP: Record<string, Priority> = {
  "1": "urgent", urgente: "urgent", urg: "urgent",
  "2": "high", alta: "high", alto: "high",
  "3": "medium", media: "medium", med: "medium",
  "4": "low", baja: "low",
};

const DAY_MAP: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, miércoles: 3,
  jueves: 4, viernes: 5, sabado: 6, sábado: 6,
};

export function parseQuickAdd(input: string): ParsedTask {
  let text = " " + input.trim() + " ";
  let dueDate: Date | null = null;
  let priority: Priority = "none";
  const tags: string[] = [];
  let projectName: string | null = null;

  // priority: !alta, !1, !urgente
  text = text.replace(/\s!([a-záéíóú0-9]+)\b/gi, (_m, p) => {
    const v = PRIORITY_MAP[p.toLowerCase()];
    if (v) { priority = v; return " "; }
    return _m;
  });

  // tags: #etiqueta
  text = text.replace(/\s#([\w\-áéíóúñ]+)/gi, (_m, t) => {
    tags.push(t.toLowerCase());
    return " ";
  });

  // project: @proyecto
  text = text.replace(/\s@([\w\-áéíóúñ]+)/gi, (_m, p) => {
    projectName = p.toLowerCase();
    return " ";
  });

  // time: 6pm, 14:30
  let timePart: { h: number; m: number } | null = null;
  text = text.replace(/\s(\d{1,2})(?::(\d{2}))?\s?(am|pm)\b/gi, (_m, h, mm, ap) => {
    let hour = parseInt(h, 10);
    const min = mm ? parseInt(mm, 10) : 0;
    if (ap.toLowerCase() === "pm" && hour < 12) hour += 12;
    if (ap.toLowerCase() === "am" && hour === 12) hour = 0;
    timePart = { h: hour, m: min };
    return " ";
  });
  text = text.replace(/\s(\d{1,2}):(\d{2})\b/g, (_m, h, mm) => {
    timePart = { h: parseInt(h, 10), m: parseInt(mm, 10) };
    return " ";
  });

  // dates
  const now = new Date();
  const todayStart = startOfDay(now);
  const lower = text.toLowerCase();

  const matchDay = (re: RegExp, fn: () => Date) => {
    if (re.test(lower)) {
      dueDate = fn();
      text = text.replace(re, " ");
    }
  };

  matchDay(/\shoy\b/i, () => todayStart);
  matchDay(/\sma(ñ|n)ana\b/i, () => addDays(todayStart, 1));
  matchDay(/\spasado\s+ma(ñ|n)ana\b/i, () => addDays(todayStart, 2));

  for (const [name, idx] of Object.entries(DAY_MAP)) {
    const re = new RegExp(`\\s${name}\\b`, "i");
    if (re.test(lower) && !dueDate) {
      dueDate = nextDay(todayStart, idx as 0 | 1 | 2 | 3 | 4 | 5 | 6);
      text = text.replace(re, " ");
    }
  }

  // dd/mm or dd-mm
  const dm = text.match(/\s(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (dm && !dueDate) {
    const d = parseInt(dm[1], 10);
    const m = parseInt(dm[2], 10) - 1;
    const y = dm[3] ? (dm[3].length === 2 ? 2000 + parseInt(dm[3], 10) : parseInt(dm[3], 10)) : now.getFullYear();
    dueDate = new Date(y, m, d);
    text = text.replace(dm[0], " ");
  }

  if (dueDate && timePart) {
    dueDate = set(dueDate, { hours: timePart.h, minutes: timePart.m, seconds: 0, milliseconds: 0 });
  }

  return {
    title: text.replace(/\s+/g, " ").trim(),
    dueDate,
    priority,
    tags,
    projectName,
  };
}
