"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { VIRTUES, DAYS } from "@/lib/virtues";

type Mark = { virtue_index: number; day_index: number; marked: boolean };

export default function BookTable({
  cycleId,
  initialMarks,
  readonly = false,
}: {
  cycleId: string;
  initialMarks: Mark[];
  readonly?: boolean;
}) {
  const [marks, setMarks] = useState<Mark[]>(initialMarks);

  const isMarked = (v: number, d: number) =>
    marks.find((m) => m.virtue_index === v && m.day_index === d)?.marked ?? false;

  async function toggle(v: number, d: number) {
    if (readonly) return;
    setMarks((prev) => {
      const next = prev.filter((m) => !(m.virtue_index === v && m.day_index === d));
      next.push({ virtue_index: v, day_index: d, marked: !isMarked(v, d) });
      return next;
    });
    await fetch("/api/marks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cycleId, virtueIndex: v, dayIndex: d }),
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs uppercase tracking-widest text-neutral-500 p-3 w-64">Дисциплина</th>
            {DAYS.map((d) => (
              <th key={d} className="text-xs uppercase tracking-widest text-neutral-500 p-3 text-center w-14">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {VIRTUES.map((v) => {
            const rowViolations = DAYS.filter((_, d) => isMarked(v.index, d)).length;
            const pure = rowViolations === 0;
            return (
              <motion.tr
                key={v.index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: v.index * 0.04, duration: 0.5 }}
                className={`border-t border-white/5 ${pure ? "text-white" : "text-neutral-400"}`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full ${pure ? "bg-emerald-400" : "bg-neutral-600"}`} />
                    <span className="text-sm">{v.index + 1}. {v.name}</span>
                  </div>
                </td>
                {DAYS.map((_, d) => {
                  const marked = isMarked(v.index, d);
                  return (
                    <td key={d} className="p-2 text-center">
                      <button
                        onClick={() => toggle(v.index, d)}
                        disabled={readonly}
                        className="w-10 h-10 rounded-lg border border-white/10 hover:border-white/30 transition-colors flex items-center justify-center disabled:opacity-40"
                        aria-label={`${v.name} ${DAYS[d]}`}
                      >
                        {marked && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="block w-3 h-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]"
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
    </div>
  );
}
