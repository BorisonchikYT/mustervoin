"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingHero() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 30, letterSpacing: "0.4em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0.15em" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-[family-name:var(--font-cinzel)] text-5xl md:text-7xl text-white"
      >
        MUSTERVOIN
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-6 max-w-xl text-neutral-400"
      >
        13 дисциплин. 13 недель. Один цикл — одна жизнь, ставшая лучше.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="mt-10 flex gap-4"
      >
        <Link href="/login" className="px-8 py-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors">
          Войти
        </Link>
        <Link href="/register" className="px-8 py-3 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors">
          Начать
        </Link>
      </motion.div>
    </main>
  );
}
