"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import ExportButton from "./ExportButton";

export default function DashboardHero({
  startedAt,
  week,
  totalWeeks,
  virtueName,
  virtueRule,
  weekViolations,
  streak,
  cycleComplete,
}: {
  startedAt: string;
  week: number;
  totalWeeks: number;
  virtueName: string;
  virtueRule: string;
  weekViolations: number;
  streak: number;
  cycleComplete: boolean;
}) {
  const progress = (week / totalWeeks) * 100;
  const dateRu = new Date(startedAt).toLocaleDateString("ru-RU");

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-16 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-baseline justify-between mb-10 md:mb-16 flex-wrap gap-4"
      >
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl lg:text-5xl text-white tracking-tight">
          MusterVoin
        </h1>
        <div className="flex gap-4 md:gap-6 text-[10px] md:text-xs uppercase tracking-[0.2em] flex-wrap">
          <Link href="/book" className="text-neutral-500 hover:text-white transition-colors">Книжка</Link>
          <Link href="/virtues" className="text-neutral-500 hover:text-white transition-colors">Дисциплины</Link>
          <Link href="/about" className="text-neutral-500 hover:text-white transition-colors">О методике</Link>
          <ExportButton />
        </div>
      </motion.div>

      {cycleComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.05] p-5"
        >
          <p className="text-emerald-300 text-sm">Цикл завершён — все 13 недель пройдены.</p>
          <Link href="/complete" className="mt-2 inline-block text-xs uppercase tracking-[0.2em] text-white hover:text-emerald-200">
            Посмотреть итоги →
          </Link>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 md:mb-14"
      >
        <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-neutral-500">Текущая неделя</p>
        <h2 className="mt-2 md:mt-3 font-[family-name:var(--font-cinzel)] text-5xl md:text-6xl lg:text-7xl text-white leading-none">
          {week + 1}
          <span className="text-neutral-600 text-2xl md:text-3xl lg:text-4xl"> / {totalWeeks}</span>
        </h2>
        <p className="mt-4 md:mt-6 text-xl md:text-2xl text-amber-100">{virtueName}</p>
        <p className="mt-2 md:mt-3 text-sm md:text-base text-neutral-400 italic max-w-2xl">«{virtueRule}»</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mb-8 md:mb-14"
      >
        <div className="h-[2px] w-full bg-white/5 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-white/40 to-amber-300/80"
          />
        </div>
        <div className="flex justify-between mt-3 text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-neutral-600 gap-2 flex-wrap">
          <span>старт {dateRu}</span>
          <span>streak: <span className={streak > 0 ? "text-emerald-400" : "text-neutral-600"}>{streak}</span></span>
          <span>нарушений: <span className={weekViolations ? "text-red-300" : "text-emerald-400"}>{weekViolations}</span></span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link
          href={`/book/week/${week}`}
          className="w-full sm:w-auto text-center px-8 md:px-10 py-3.5 md:py-4 rounded-full bg-white text-black font-medium hover:bg-amber-200 transition-colors"
        >
          Открыть книжку недели {week + 1} →
        </Link>
        <Link
          href="/virtues"
          className="w-full sm:w-auto text-center px-8 md:px-10 py-3.5 md:py-4 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors"
        >
          Все дисциплины
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-12 md:mt-20 text-[11px] md:text-xs text-neutral-600 max-w-xl leading-relaxed"
      >
        Каждая неделя — отдельная страница книжки. Клик по клетке: пусто → ✓ проверено, чисто → ● нарушил → пусто.
        Все 7 дней отмечены — неделя засчитана. Строка чистая, если все 7 дней ✓.
      </motion.p>
    </main>
  );
}
