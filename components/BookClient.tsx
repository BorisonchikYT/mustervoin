"use client";
import { useState } from "react";
import BookTable from "./BookTable";
import BookTableMobile from "./BookTableMobile";

export type Mark = {
  week_index: number;
  virtue_index: number;
  day_index: number;
  marked: boolean;
};

export type MarkState = "empty" | "clean" | "violation";

export default function BookClient({
  cycleId,
  weekIndex,
  currentWeek,
  todayIndex,
  initialMarks,
  readonly = false,
}: {
  cycleId: string;
  weekIndex: number;
  currentWeek: number;
  todayIndex: number;
  initialMarks: Mark[];
  readonly?: boolean;
}) {
  const [marks, setMarks] = useState<Mark[]>(initialMarks);

  const stateOf = (v: number, d: number): MarkState => {
    const m = marks.find(
      (m) => m.week_index === weekIndex && m.virtue_index === v && m.day_index === d
    );
    if (!m) return "empty";
    return m.marked ? "violation" : "clean";
  };

  const canEdit = (v: number, d: number) => {
    if (readonly) return false;
    if (weekIndex !== currentWeek) return false;
    if (v > currentWeek) return false;
    if (d > todayIndex) return false;
    return true;
  };

  async function cycle(v: number, d: number) {
    if (!canEdit(v, d)) return;
    const current = stateOf(v, d);
    const next: MarkState =
      current === "empty" ? "clean" : current === "clean" ? "violation" : "empty";

    // Оптимистичное обновление
    setMarks((prev) => {
      const filtered = prev.filter(
        (m) =>
          !(
            m.week_index === weekIndex &&
            m.virtue_index === v &&
            m.day_index === d
          )
      );
      if (next === "empty") return filtered;
      filtered.push({
        week_index: weekIndex,
        virtue_index: v,
        day_index: d,
        marked: next === "violation",
      });
      return filtered;
    });

    try {
      const res = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycleId,
          weekIndex,
          virtueIndex: v,
          dayIndex: d,
          mode: "cycle",
        }),
      });
      if (!res.ok) {
        // Откат при ошибке
        setMarks((prev) => {
          const filtered = prev.filter(
            (m) =>
              !(
                m.week_index === weekIndex &&
                m.virtue_index === v &&
                m.day_index === d
              )
          );
          if (current === "empty") return filtered;
          filtered.push({
            week_index: weekIndex,
            virtue_index: v,
            day_index: d,
            marked: current === "violation",
          });
          return filtered;
        });
      }
    } catch {
      // Откат при сетевой ошибке
      setMarks((prev) => {
        const filtered = prev.filter(
          (m) =>
            !(
              m.week_index === weekIndex &&
              m.virtue_index === v &&
              m.day_index === d
            )
        );
        if (current === "empty") return filtered;
        filtered.push({
          week_index: weekIndex,
          virtue_index: v,
          day_index: d,
          marked: current === "violation",
        });
        return filtered;
      });
    }
  }

  return (
    <>
      <BookTable
        weekIndex={weekIndex}
        currentWeek={currentWeek}
        todayIndex={todayIndex}
        marks={marks}
        stateOf={stateOf}
        canEdit={canEdit}
        onCycle={cycle}
      />
      <BookTableMobile
        weekIndex={weekIndex}
        currentWeek={currentWeek}
        todayIndex={todayIndex}
        marks={marks}
        stateOf={stateOf}
        canEdit={canEdit}
        onCycle={cycle}
      />
    </>
  );
}