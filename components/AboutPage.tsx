"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen px-4 md:px-6 py-10 md:py-16 max-w-2xl mx-auto">
      <Link href="/dashboard" className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-white">
        ← Дашборд
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-6 font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl text-white"
      >
        О методике
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mt-8 space-y-5 text-sm md:text-base text-neutral-300 leading-relaxed"
      >
        <p>
          В 1726 году Бенджамин Франклин, тогда 20-летний печатник, завёл небольшую книжечку.
          В ней было 13 страниц — по одной на каждую добродетель, которую он хотел в себе воспитать.
          На каждой странице — таблица на неделю: 7 столбцов (дни) и 13 строк (добродетели).
        </p>
        <p>
          Каждую неделю он концентрировался на одной добродетели. Каждый вечер честно спрашивал себя,
          не нарушил ли правило. Если да — ставил точку в соответствующей клетке.
          Цель — чистая строка: семь дней без единой точки.
        </p>
        <p>
          Полный цикл занимал 13 недель. За год можно было пройти его 4 раза.
          Франклин не стал идеальным — он сам признавал, что «Порядок» так и не дался ему до конца.
          Но упражнение дало ему привычку ежедневной рефлексии, которую он сохранил на всю жизнь.
        </p>
        <p className="text-neutral-400 italic border-l border-white/10 pl-4">
          «Я не пытался приобрести все добродетели сразу, но решил обратить внимание на одну
          в течение определённого времени, а когда овладевал ею, переходил к следующей».
        </p>
      </motion.div>

      <h2 className="mt-10 mb-4 text-xs uppercase tracking-[0.25em] text-neutral-500">Как работает этот сайт</h2>
      <ol className="space-y-3 text-sm md:text-base text-neutral-300 list-none">
        <li><span className="text-amber-300">1.</span> Каждая неделя — отдельная страница книжки.</li>
        <li><span className="text-amber-300">2.</span> Клик по клетке: пусто → ✓ (проверено, чисто) → ● (нарушил) → пусто.</li>
        <li><span className="text-amber-300">3.</span> Когда все 7 дней явно отмечены — неделя завершена, сайт переходит к следующей.</li>
        <li><span className="text-amber-300">4.</span> Строка считается чистой, если все 7 дней — ✓.</li>
        <li><span className="text-amber-300">5.</span> Через 13 недель — цикл завершён. Начинается новый.</li>
      </ol>

      <p className="mt-8 text-xs text-neutral-600">
        Это инструмент для ежедневной рефлексии, а не для самобичевания.
        Точки — это данные, а не приговор.
      </p>
    </main>
  );
}
