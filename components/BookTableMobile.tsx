"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VIRTUES, DAYS_RU } from "@/lib/virtues";

type Mark = { week_index: number; virtue_index: number; day_index: number; marked: boolean };
type State = "empty" | "clean" | "violation";

export default function BookTableMobile({
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
  const isCurrentWeek = weekIndex === currentWeek;

  const stateOf = (v: number, d: number): State => {
    const m = marks.find(
      (m) => m.week_index === weekIndex && m.virtue_index === v && m.day_index === d
    );
    if (!m) return "empty";
    return m.marked ? "violation" : "clean";
  };

  const canEdit = (v: number, d: number) =>
    !readonly && isCurrentWeek && v <= currentWeek && d <= todayIndex;

  async function cycle(v: number, d: number) {
    if (!canEdit(v, d)) return;
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
      body: JSON.stringify({ cycleId, weekIndex, virtueIndex: v, dayIndex: d, mode: "cycle" }),
    });
  }

  return (
    <div className="md:hidden space-y-3">
      {VIRTUES.map((v, vi) => {
        const isActive = isCurrentWeek && v.index === currentWeek;
        const isFuture = isCurrentWeek && v.index > currentWeek;
        let violations = 0;
        let clean = 0;
        for (let d = 0; d < 7; d++) {
          const s = stateOf(v.index, d);
          if (s === "violation") violations++;
          else if (s === "clean") clean++;
        }
        const pure = violations === 0 && clean === 7;

        return (
          <motion.div
            key={v.index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: vi * 0.025, duration: 0.3 }}
            className={`rounded-2xl border p-4 ${
              isActive
                ? "border-amber-300/30 bg-amber-300/[0.04]"
                : isFuture
                ? "border-white/5 bg-white/[0.01] opacity-40"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    pure ? "bg-emerald-400" : "bg-neutral-600"
                  }`}
                />
                <div className="min-w-0">
                  <p
                    className={`text-sm truncate ${
                      isActive ? "text-amber-200 font-medium" : pure ? "text-white" : "text-neutral-400"
                    }`}
                  >
                    {v.index + 1}. {v.name}
                  </p>
                  {isActive && (
                    <p className="text-[9px] uppercase tracking-widest text-amber-300/70">фокус</p>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-neutral-600 whitespace-nowrap">
                {violations > 0 ? `-${violations}` : clean > 0 ? `+${clean}` : "-"}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_RU.map((label, d) => {
                const s = stateOf(v.index, d);
                const isToday = isCurrentWeek && d === todayIndex;
                const editable = canEdit(v.index, d);
                return (
                  <div key={d} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => cycle(v.index, d)}
                      disabled={!editable}
                      aria-label={`${v.name} ${label}: ${s}`}
                      className={`w-full aspect-square rounded-xl border flex items-center justify-center transition-all ${
                        isToday
                          ? "border-amber-300/50 bg-amber-300/[0.06]"
                          : "border-white/10"
                      } ${editable ? "active:scale-95" : ""} ${
                        !editable && s === "empty" ? "opacity-30" : ""
                      }`}
                    >
                      {s === "violation" && (
                        <span className="block w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
                      )}
                      {s === "clean" && (
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8.5L6.5 12L13 4.5" stroke="rgba(52,211,153,0.9)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    <span
                      className={`text-[9px] uppercase tracking-wider ${
                        isToday ? "text-amber-300" : "text-neutral-600"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {isActive && (
              <AnimatePresence>
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 text-xs text-neutral-500 italic"
                >
                  «{v.rule}»
                </motion.p>
              </AnimatePresence>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
