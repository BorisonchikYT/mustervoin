"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function WeekSwitcher({
  currentWeek,
  shownWeek,
}: {
  currentWeek: number;
  shownWeek: number;
}) {
  const items = Array.from({ length: 13 }, (_, i) => i);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="no-scrollbar -mx-4 px-4 mb-8 overflow-x-auto"
    >
      <div className="flex gap-2 w-max">
        {items.map((i) => {
          const isShown = i === shownWeek;
          const isFuture = i > currentWeek;
          const isCurrent = i === currentWeek;
          return (
            <Link
              key={i}
              href={`/book/week/${i}`}
              className={`relative flex-shrink-0 w-10 h-10 rounded-full text-xs uppercase tracking-widest border flex items-center justify-center transition-all ${
                isShown
                  ? "border-amber-300/60 text-amber-200 bg-amber-300/[0.08]"
                  : isFuture
                  ? "border-white/5 text-neutral-700 pointer-events-none"
                  : "border-white/10 text-neutral-400 hover:border-white/30 hover:text-white"
              }`}
            >
              {i + 1}
              {isCurrent && !isShown && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-300" />
              )}
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
