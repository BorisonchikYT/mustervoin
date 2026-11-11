"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VIRTUES, DAYS, DAYS_RU } from "@/lib/virtues";

type Mark = { week_index: number; virtue_index: number; day_index: number; marked: boolean };

type Props = {
  cycleId: string;
  /** Неделя, которую сейчас показываем (0..12) */
  weekIndex: number;
  /** Неделя, которая сейчас «идёт» по календарю */
  currentWeek: number;
  /** Какой сегодня день недели (0=Sun..6=Sat) */
  todayIndex: number;
  initialMarks: Mark[];
  readonly?: boolean;
};

export default function BookTable({
  cycleId,
  weekIndex,
  currentWeek,
  todayIndex,
  initialMarks,
  readonly = false,
}: Props) {
  const [marks, setMarks] = useState<Mark[]>(initialMarks);
  const isPastWeek = weekIndex < currentWeek;
  const isCurrentWeek = weekIndex === currentWeek;
  const isFutureWeek = weekIndex > currentWeek;

  const isMarked = (v: number, d: number) =>
    marks.find(
      (m) => m.week_index === weekIndex && m.virtue_index === v && m.day_index === d
    )?.marked ?? false;

  // Какие дисциплины вообще можно редактировать на этой неделе
  const editableVirtue = (v: number) => {
    if (readonly) return false;
    if (isPastWeek) return false;
    if (isFutureWeek) return false;
    // активна текущая дисциплина недели и все предыдущие
    return v <= currentWeek;
  };

  const editableDay = (d: number) => {
    if (!isCurrentWeek) return false;
    // редактировать можно только дни до сегодня включительно
    return d <= todayIndex;
  };

  async function toggle(v: number, d: number) {
    if (!editableVirtue(v) || !editableDay(d)) return;
    const wasMarked = isMarked(v, d);
    // optimistic
    setMarks((prev) => {
      const next = prev.filter(
        (m) => !(m.week_index === weekIndex && m.virtue_index === v && m.day_index === d)
      );
      next.push({ week_index: weekIndex, virtue_index: v, day_index: d, marked: !wasMarked });
      return next;
    });
    await fetch("/api/marks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cycleId, weekIndex, virtueIndex: v, dayIndex: d }),
    });
  }

  // Статистика по строке для этой недели
  const rowViolations = (v: number) =>
    DAYS.filter((_, d) => isMarked(v, d)).length;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.035, delayChildren: 0.1 } },
  };
  const rowAnim = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
    >
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-[10px] uppercase tracking-[0.2em] text-neutral-500 p-4 w-64">
              Дисциплина
            </th>
            {DAYS.map((d, i) => {
              const isToday = isCurrentWeek && i === todayIndex;
              const isFuture = isCurrentWeek && i > todayIndex;
              return (
                <th
                  key={d}
                  className={`text-[10px] uppercase tracking-[0.2em] p-3 text-center w-16 transition-colors ${
                    isToday
                      ? "text-amber-300"
                      : isFuture
                      ? "text-neutral-700"
                      : "text-neutral-500"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{d}</span>
                    {isToday && (
                      <motion.span
                        layoutId="today-dot"
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
          {VIRTUES.map((v) => {
            const violations = rowViolations(v.index);
            const pure = violations === 0;
            const isActiveDiscipline = isCurrentWeek && v.index === currentWeek;
            const isPastDiscipline = v.index < currentWeek;
            const isFutureDiscipline = v.index > currentWeek;
            const locked = !editableVirtue(v.index);

            return (
              <motion.tr
                key={v.index}
                variants={rowAnim}
                className={`border-t border-white/5 transition-colors ${
                  isActiveDiscipline
                    ? "bg-amber-300/[0.04]"
                    : isPastDiscipline && isCurrentWeek
                    ? "bg-white/[0.01]"
                    : isFutureDiscipline && isCurrentWeek
                    ? "opacity-30"
                    : locked && isPastWeek
                    ? "opacity-70"
                    : ""
                }`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <motion.span
                      animate={
                        pure && !isFutureDiscipline
                          ? { boxShadow: "0 0 10px rgba(52,211,153,0.9)" }
                          : { boxShadow: "0 0 0px rgba(0,0,0,0)" }
                      }
                      transition={{ duration: 0.8 }}
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        pure && !isFutureDiscipline ? "bg-emerald-400" : "bg-neutral-600"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span
                        className={`text-sm ${
                          isActiveDiscipline
                            ? "text-amber-200 font-medium"
                            : pure && !isFutureDiscipline
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
                  const marked = isMarked(v.index, d);
                  const isToday = isCurrentWeek && d === todayIndex;
                  const isFutureDay = isCurrentWeek && d > todayIndex;
                  const canClick =
                    editableVirtue(v.index) && editableDay(d);

                  return (
                    <td key={d} className="p-2 text-center">
                      <button
                        onClick={() => toggle(v.index, d)}
                        disabled={!canClick}
                        aria-label={`${v.name} ${DAYS_RU[d]}`}
                        className={`relative w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                          isToday
                            ? "border-amber-300/40 bg-amber-300/[0.06]"
                            : "border-white/10"
                        } ${
                          canClick
                            ? "hover:border-white/40 hover:bg-white/[0.05] cursor-pointer"
                            : "cursor-not-allowed"
                        } ${isFutureDay && !marked ? "opacity-30" : ""}`}
                      >
                        <AnimatePresence>
                          {marked && (
                            <motion.span
                              key="dot"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 520, damping: 22 }}
                              className="block w-3 h-3 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.85)]"
                            />
                          )}
                        </AnimatePresence>
                        {!marked && isToday && canClick && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.15, 0.35, 0.15] }}
                            transition={{ repeat: Infinity, duration: 2.4 }}
                            className="absolute inset-1.5 rounded-lg border border-amber-300/30 pointer-events-none"
                          />
                        )}
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
