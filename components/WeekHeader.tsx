"use client";
import { motion } from "framer-motion";

export default function WeekHeader({
  weekNum,
  isCurrent,
  isPast,
  virtueName,
  virtueRule,
}: {
  weekNum: number;
  isCurrent: boolean;
  isPast: boolean;
  virtueName: string;
  virtueRule: string;
}) {
  return (
    <div className="mt-6 mb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-baseline gap-4 flex-wrap"
      >
        <h1 className="font-[family-name:var(--font-cinzel)] text-5xl md:text-6xl text-white tracking-tight">
          Неделя {weekNum + 1}
        </h1>
        <span
          className={`text-xs uppercase tracking-[0.25em] px-3 py-1 rounded-full border ${
            isCurrent
              ? "border-amber-300/40 text-amber-300"
              : isPast
              ? "border-white/10 text-neutral-500"
              : "border-white/5 text-neutral-700"
          }`}
        >
          {isCurrent ? "сейчас" : isPast ? "архив" : "впереди"}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4"
      >
        <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Фокус недели</p>
        <p className="mt-1 text-xl text-amber-100">{virtueName}</p>
        <p className="mt-3 text-neutral-400 italic max-w-2xl">«{virtueRule}»</p>
      </motion.div>
    </div>
  );
}
