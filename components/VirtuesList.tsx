"use client";
import { motion } from "framer-motion";
import type { Virtue } from "@/lib/virtues";

export default function VirtuesList({ virtues }: { virtues: Virtue[] }) {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl text-white mb-12"
      >
        13 дисциплин
      </motion.h1>
      <ol className="space-y-8">
        {virtues.map((v) => (
          <motion.li
            key={v.index}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: v.index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="border-l border-white/10 pl-6"
          >
            <h2 className="text-white text-lg">
              {v.index + 1}. {v.name}
            </h2>
            <p className="text-neutral-400 mt-1">{v.rule}</p>
          </motion.li>
        ))}
      </ol>
    </>
  );
}
