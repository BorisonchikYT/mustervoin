"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "mustervoin-reminder";
type ReminderState = "unset" | "enabled" | "declined";

function getStored(): ReminderState {
  if (typeof window === "undefined") return "unset";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "enabled" || v === "declined") return v;
  return "unset";
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function ReminderBanner({ todayMarked }: { todayMarked: boolean }) {
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<ReminderState>("unset");

  useEffect(() => {
    const stored = getStored();
    setState(stored);
    const h = new Date().getHours();
    const isEvening = true;
    if (isEvening && !todayMarked && stored === "unset") {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, [todayMarked]);

  async function enable() {
    setVisible(false);
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!pub) {
      localStorage.setItem(STORAGE_KEY, "declined");
      setState("declined");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      localStorage.setItem(STORAGE_KEY, "declined");
      setState("declined");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(pub),
        });
      }
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("save failed");
      localStorage.setItem(STORAGE_KEY, "enabled");
      setState("enabled");
    } catch {
      localStorage.setItem(STORAGE_KEY, "declined");
      setState("declined");
    }
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setState("declined");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && state === "unset" && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 rounded-2xl border border-white/10 bg-neutral-900/95 backdrop-blur-md p-4 shadow-2xl"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300/80">
            Напоминание
          </p>
          <p className="mt-2 text-sm text-white">
            Вечером напоминать про книжку?
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Один раз в день, только если сегодняшний день ещё не отмечен.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={enable}
              className="flex-1 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-amber-200 transition"
            >
              Включить
            </button>
            <button
              onClick={decline}
              className="flex-1 px-4 py-2 rounded-full border border-white/10 text-neutral-400 text-sm hover:border-white/30 hover:text-white transition"
            >
              Не сейчас
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}