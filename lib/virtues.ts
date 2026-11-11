export type Virtue = { index: number; name: string; rule: string };

export const VIRTUES: Virtue[] = [
  { index: 0,  name: "Воздержание", rule: "Не ешь до отупения, не пей до опьянения." },
  { index: 1,  name: "Молчание",    rule: "Говори только то, что принесёт пользу тебе или другим. Избегай пустой болтовни." },
  { index: 2,  name: "Порядок",     rule: "Каждой вещи — своё место, каждому делу — своё время." },
  { index: 3,  name: "Решимость",   rule: "Делай то, что должен, и доводи начатое до конца." },
  { index: 4,  name: "Бережливость",rule: "Трать только на то, что приносит пользу. Ничего не трать зря." },
  { index: 5,  name: "Трудолюбие",  rule: "Не теряй времени. Будь всегда занят чем-то полезным." },
  { index: 6,  name: "Искренность", rule: "Не используй вредного обмана. Думай невинно и справедливо." },
  { index: 7,  name: "Справедливость", rule: "Не причиняй вреда другим, не оставляй без помощи то, что обязан сделать." },
  { index: 8,  name: "Умеренность", rule: "Избегай крайностей. Не держи зла дольше, чем оно того заслуживает." },
  { index: 9,  name: "Чистота",     rule: "Не терпи грязи на теле, в одежде или жилище." },
  { index: 10, name: "Спокойствие", rule: "Не расстраивайся из-за пустяков или неизбежных случайностей." },
  { index: 11, name: "Целомудрие",  rule: "Редко предавайся удовольствиям, только ради здоровья или потомства." },
  { index: 12, name: "Смирение",    rule: "Подражай Иисусу и Сократу." },
];

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const DAYS_RU = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;

export function todayDayIndex(): number {
  return new Date().getDay();
}

export function computeCurrentWeek(
  marks: { week_index: number; day_index: number; virtue_index: number; marked: boolean }[],
  cycleStartedAt: string | Date
): number {
  const start = new Date(cycleStartedAt).getTime();
  const daysSinceStart = Math.floor((Date.now() - start) / 86400000);
  const calendarCap = Math.min(12, Math.max(0, Math.floor(daysSinceStart / 7)));
  for (let w = 0; w <= 12; w++) {
    const weekMarks = marks.filter((m) => m.week_index === w);
    const explicitlyMarkedDays = new Set(weekMarks.map((m) => m.day_index));
    if (explicitlyMarkedDays.size < 7) {
      return Math.min(w, calendarCap);
    }
  }
  return 12;
}