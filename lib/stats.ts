type Mark = { week_index: number; virtue_index: number; day_index: number; marked: boolean };

export function computeStreak(marks: Mark[]): number {
  const byDay = new Map<string, boolean>();
  for (const m of marks) {
    const key = `${m.week_index}:${m.day_index}`;
    if (m.marked) byDay.set(key, true);
    else if (!byDay.has(key)) byDay.set(key, false);
  }

  const ordered: boolean[] = [];
  for (let w = 0; w <= 12; w++) {
    for (let d = 0; d < 7; d++) {
      const v = byDay.get(`${w}:${d}`);
      if (v === undefined) continue;
      ordered.push(v);
    }
  }

  let streak = 0;
  for (let i = ordered.length - 1; i >= 0; i--) {
    if (ordered[i]) break;
    streak++;
  }
  return streak;
}

export function weekViolations(marks: Mark[], week: number): number {
  return marks.filter((m) => m.week_index === week && m.marked).length;
}

export function weekExplicitDays(marks: Mark[], week: number): number {
  return new Set(marks.filter((m) => m.week_index === week).map((m) => m.day_index)).size;
}

export function isWeekComplete(marks: Mark[], week: number): boolean {
  return weekExplicitDays(marks, week) === 7;
}

export function isWeekClean(marks: Mark[], week: number): boolean {
  return isWeekComplete(marks, week) && weekViolations(marks, week) === 0;
}

export function isCycleComplete(marks: Mark[]): boolean {
  for (let w = 0; w < 13; w++) {
    if (!isWeekComplete(marks, w)) return false;
  }
  return true;
}
