"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { username, password, redirect: false });
    if (res?.error) setError("Неверные данные");
    else router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        onSubmit={submit}
        className="w-full max-w-sm space-y-5 bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur"
      >
        <h1 className="text-2xl text-white font-[family-name:var(--font-cinzel)]">Вход</h1>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Логин"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-white/30" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-white/30" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition">Войти</button>
      </motion.form>
    </main>
  );
}
