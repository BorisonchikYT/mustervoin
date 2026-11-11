"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Virtue } from "@/lib/virtues";

export default function VirtuesList({ virtues }: { virtues: Virtue[] }) {
  return (
    <>
      <Link href="/dashboard" className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-white">
        ← Дашборд
      </Link>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-6 font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl lg:text-5xl text-white mb-8 md:mb-12"
      >
        13 дисциплин
      </motion.h1>
      <ol className="space-y-6 md:space-y-8">
        {virtues.map((v) => (
          <motion.li
            key={v.index}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: v.index * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="border-l border-white/10 pl-4 md:pl-6"
          >
            <h2 className="text-white text-base md:text-lg">{v.index + 1}. {v.name}</h2>
            <p className="text-neutral-400 mt-1 text-sm md:text-base">{v.rule}</p>
          </motion.li>
        ))}
      </ol>
    </>
  );
}
