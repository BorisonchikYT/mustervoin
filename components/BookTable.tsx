"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VIRTUES, DAYS, DAYS_RU } from "@/lib/virtues";

type Mark = { week_index: number; virtue_index: number; day_index: number; marked: boolean };

type Props = {
  cycleId: string;
  weekIndex: number;
  currentWeek: number;
  todayIndex: number;
  initialMarks: Mark[];
  readonly?: boolean;
};

type State = "empty" | "clean" | "violation";

export default function BookTable({
  cycleId,
  weekIndex,
  currentWeek,
  todayIndex,
  initialMarks,
  readonly = false,
}: Props) {
  const [marks, setMarks] = useState<Mark[]>(initialMarks);
  const isCurrentWeek = weekIndex === currentWeek;
  const isPastWeek = weekIndex < currentWeek;
  const isFutureWeek = weekIndex > currentWeek;

  const stateOf = (v: number, d: number): State => {
    const m = marks.find(
      (m) => m.week_index === weekIndex && m.virtue_index === v && m.day_index === d
    );
    if (!m) return "empty";
    return m.marked ? "violation" : "clean";
  };

  const editableVirtue = (v: number) => {
    if (readonly) return false;
    if (!isCurrentWeek) return false;
    return v <= currentWeek;
  };

  const editableDay = (d: number) => {
    if (!isCurrentWeek) return false;
    return d <= todayIndex;
  };

  async function cycle(v: number, d: number) {
    if (!editableVirtue(v) || !editableDay(d)) return;
    const current = stateOf(v, d);
    const next: State = current === "empty" ? "clean" : current === "clean" ? "violation" : "empty";

    setMarks((prev) => {
      const filtered = prev.filter(
        (m) => !(m.week_index === weekIndex && m.virtue_index === v && m.day_index === d)
      );
      if (next === "empty") return filtered;
      filtered.push({ week_index: weekIndex, virtue_index: v, day_index: d, marked: next === "violation" });
      return filtered;
    });

    await fetch("/api/marks", {
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
  }

  const rowStats = (v: number) => {
    let violations = 0;
    let clean = 0;
    for (let d = 0; d < 7; d++) {
      const s = stateOf(v, d);
      if (s === "violation") violations++;
      else if (s === "clean") clean++;
    }
    return { violations, clean, empty: 7 - violations - clean };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
    >
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr>
            <th className="text-left text-[10px] uppercase tracking-[0.2em] text-neutral-500 p-4 w-56 lg:w-64">
              Дисциплина
            </th>
            {DAYS.map((d, i) => {
              const isToday = isCurrentWeek && i === todayIndex;
              const isFuture = isCurrentWeek && i > todayIndex;
              return (
                <th
                  key={d}
                  className={`text-[10px] uppercase tracking-[0.2em] p-3 text-center w-14 lg:w-16 ${
                    isToday ? "text-amber-300" : isFuture ? "text-neutral-700" : "text-neutral-500"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{d}</span>
                    {isToday && (
                      <motion.span
                        layoutId="today-dot-desktop"
                        className="block w-1 h-1 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]"
                      />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {VIRTUES.map((v, vi) => {
            const stats = rowStats(v.index);
            const pure = stats.violations === 0 && stats.empty === 0;
            const isActiveDiscipline = isCurrentWeek && v.index === currentWeek;
            const isFutureDiscipline = isCurrentWeek && v.index > currentWeek;
            const locked = !editableVirtue(v.index);

            return (
              <motion.tr
                key={v.index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: vi * 0.03, duration: 0.35 }}
                className={`border-t border-white/5 transition-colors ${
                  isActiveDiscipline
                    ? "bg-amber-300/[0.04]"
                    : isFutureDiscipline
                    ? "opacity-30"
                    : locked && isPastWeek
                    ? "opacity-70"
                    : ""
                }`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        pure ? "bg-emerald-400" : "bg-neutral-600"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span
                        className={`text-sm ${
                          isActiveDiscipline
                            ? "text-amber-200 font-medium"
                            : pure
                            ? "text-white"
                            : "text-neutral-400"
                        }`}
                      >
                        {v.index + 1}. {v.name}
                      </span>
                      {isActiveDiscipline && (
                        <span className="text-[10px] uppercase tracking-widest text-amber-300/70 mt-0.5">
                          фокус недели
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {DAYS.map((_, d) => {
                  const s = stateOf(v.index, d);
                  const isToday = isCurrentWeek && d === todayIndex;
                  const isFutureDay = isCurrentWeek && d > todayIndex;
                  const canClick = editableVirtue(v.index) && editableDay(d);

                  return (
                    <td key={d} className="p-2 text-center">
                      <button
                        onClick={() => cycle(v.index, d)}
                        disabled={!canClick}
                        aria-label={`${v.name} ${DAYS_RU[d]}: ${s}`}
                        className={`relative w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                          isToday ? "border-amber-300/40 bg-amber-300/[0.06]" : "border-white/10"
                        } ${
                          canClick
                            ? "hover:border-white/40 hover:bg-white/[0.05] cursor-pointer"
                            : "cursor-not-allowed"
                        } ${isFutureDay && s === "empty" ? "opacity-30" : ""}`}
                      >
                        <AnimatePresence mode="wait">
                          {s === "violation" && (
                            <motion.span
                              key="violation"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: "spring", stiffness: 520, damping: 22 }}
                              className="block w-3 h-3 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.85)]"
                            />
                          )}
                          {s === "clean" && (
                            <motion.svg
                              key="clean"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 520, damping: 22 }}
                              width="16" height="16" viewBox="0 0 16 16" fill="none"
                            >
                              <path d="M3 8.5L6.5 12L13 4.5" stroke="rgba(52,211,153,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </motion.svg>
                          )}
                          {s === "empty" && isToday && canClick && (
                            <motion.span
                              key="pulse"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.15, 0.35, 0.15] }}
                              transition={{ repeat: Infinity, duration: 2.4 }}
                              className="absolute inset-1.5 rounded-lg border border-amber-300/30 pointer-events-none"
                            />
                          )}
                        </AnimatePresence>
                      </button>
                    </td>
                  );
                })}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}
