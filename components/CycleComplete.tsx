"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function CycleComplete({
  startedAt,
  weeks,
  cycleId,
}: {
  startedAt: string;
  weeks: { week: number; virtue: string; violations: number; checked: number; complete: boolean }[];
  cycleId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const totalViolations = weeks.reduce((s, w) => s + w.violations, 0);
  const completeWeeks = weeks.filter((w) => w.complete).length;
  const dateRu = new Date(startedAt).toLocaleDateString("ru-RU");

  async function startNew() {
    if (!confirm("Начать новый цикл? Текущий уйдёт в архив.")) return;
    setLoading(true);
    const res = await fetch("/api/cycles/finish", { method: "POST" });
    if (res.ok) router.push("/dashboard");
    else setLoading(false);
  }

  return (
    <main className="min-h-screen px-4 md:px-6 py-10 md:py-16 max-w-3xl mx-auto">
      <Link href="/dashboard" className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-white">
        ← Дашборд
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-6 font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl text-white"
      >
        Итоги цикла
      </motion.h1>
      <p className="mt-2 text-sm text-neutral-500">старт {dateRu}</p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500">Всего нарушений</p>
          <p className="mt-1 text-2xl text-white">{totalViolations}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500">Недель завершено</p>
          <p className="mt-1 text-2xl text-white">{completeWeeks} / 13</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 col-span-2 md:col-span-1">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500">Среднее</p>
          <p className="mt-1 text-2xl text-white">
            {(totalViolations / 13).toFixed(1)}
          </p>
        </div>
      </motion.div>

      <h2 className="mt-10 mb-4 text-xs uppercase tracking-[0.25em] text-neutral-500">По неделям</h2>
      <div className="space-y-2">
        {weeks.map((w, i) => (
          <motion.div
            key={w.week}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.03 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10px] text-neutral-600 w-6">{w.week + 1}.</span>
              <span className="text-sm text-white truncate">{w.virtue}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] whitespace-nowrap">
              <span className="text-neutral-500">{w.checked}/7</span>
              <span className={w.violations === 0 && w.complete ? "text-emerald-400" : w.violations > 0 ? "text-red-300" : "text-neutral-600"}>
                {w.complete ? (w.violations === 0 ? "чисто" : `-${w.violations}`) : "не закончена"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button
          onClick={startNew}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-medium hover:bg-amber-200 transition disabled:opacity-50"
        >
          {loading ? "..." : "Начать новый цикл"}
        </button>
        <Link
          href="/dashboard"
          className="w-full sm:w-auto text-center px-8 py-3.5 rounded-full border border-white/20 text-white hover:bg-white/5 transition"
        >
          Остаться
        </Link>
      </div>
    </main>
  );
}
