"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingHero() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 24, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0.12em" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white break-words"
      >
        MUSTERVOIN
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7 }}
        className="mt-4 md:mt-6 max-w-xl text-sm md:text-base text-neutral-400"
      >
        13 дисциплин. 13 недель. Один цикл — одна жизнь, ставшая лучше.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-6 sm:px-0"
      >
        <Link href="/login" className="w-full sm:w-auto text-center px-8 py-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors">
          Войти
        </Link>
        <Link href="/register" className="w-full sm:w-auto text-center px-8 py-3 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors">
          Начать
        </Link>
      </motion.div>
    </main>
  );
}
