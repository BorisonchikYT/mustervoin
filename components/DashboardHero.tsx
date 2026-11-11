"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardHero({
  startedAt,
  week,
  totalWeeks,
  virtueIndex,
  virtueName,
  virtueRule,
  weekViolations,
}: {
  startedAt: string;
  week: number;
  totalWeeks: number;
  virtueIndex: number;
  virtueName: string;
  virtueRule: string;
  weekViolations: number;
}) {
  const progress = (week / totalWeeks) * 100;
  const dateRu = new Date(startedAt).toLocaleDateString("ru-RU");

  return (
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex items-baseline justify-between mb-16 flex-wrap gap-4"
      >
        <h1 className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl text-white tracking-tight">
          MusterVoin
        </h1>
        <div className="flex gap-6 text-xs uppercase tracking-[0.2em]">
          <Link href="/virtues" className="text-neutral-500 hover:text-white transition-colors">
            Дисциплины
          </Link>
          <Link href="/book" className="text-neutral-500 hover:text-white transition-colors">
            Книжка
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-14"
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Текущая неделя</p>
        <h2 className="mt-3 font-[family-name:var(--font-cinzel)] text-6xl md:text-7xl text-white leading-none">
          {week + 1}
          <span className="text-neutral-600 text-3xl md:text-4xl"> / {totalWeeks}</span>
        </h2>
        <p className="mt-6 text-2xl text-amber-100">
          {virtueName}
        </p>
        <p className="mt-3 text-neutral-400 italic max-w-2xl">«{virtueRule}»</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.35 }}
        className="mb-14"
      >
        <div className="h-[2px] w-full bg-white/5 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-white/40 to-amber-300/80"
          />
        </div>
        <div className="flex justify-between mt-3 text-[10px] uppercase tracking-[0.25em] text-neutral-600">
          <span>старт {dateRu}</span>
          <span>
            нарушений на неделе: <span className={weekViolations ? "text-red-300" : "text-emerald-400"}>{weekViolations}</span>
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        <Link
          href={`/book/week/${week}`}
          className="inline-block px-10 py-4 rounded-full bg-white text-black font-medium hover:bg-amber-200 transition-colors"
        >
          Открыть книжку недели {week + 1} →
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-20 text-xs text-neutral-600 max-w-xl leading-relaxed"
      >
        Каждая неделя — отдельная страница книжки. На ней ты отмечаешь нарушения всех уже
        освоенных дисциплин и текущей. Строка считается чистой, если за 7 дней нет ни одной
        точки.
      </motion.p>
    </main>
  );
}
