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

export default function ReminderBanner({
  todayMarked,
}: {
  todayMarked: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<ReminderState>("unset");
  const [now, setNow] = useState(0);

  useEffect(() => {
    setState(getStored());
    const h = new Date().getHours();
    setNow(h);
    // Показываем баннер только если:
    // - вечер (после 18:00)
    // - сегодняшний день не отмечен
    // - ещё не решал
    const isEvening = h >= 18 || h < 4;
    if (isEvening && !todayMarked && getStored() === "unset") {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, [todayMarked]);

  // Если разрешение уже получено и день не отмечен — показываем уведомление
  useEffect(() => {
    if (state !== "enabled") return;
    if (todayMarked) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const h = new Date().getHours();
    const isEvening = h >= 18 || h < 4;
    if (!isEvening) return;

    const lastShown = Number(localStorage.getItem("mustervoin-reminder-last") || "0");
    const nowTs = Date.now();
    // Не чаще раза в 6 часов
    if (nowTs - lastShown < 6 * 3600 * 1000) return;

    try {
      new Notification("MusterVoin", {
        body: "Не забудь отметить сегодняшний день в книжке.",
        icon: "/icon.svg",
        tag: "mustervoin-daily",
      });
      localStorage.setItem("mustervoin-reminder-last", String(nowTs));
    } catch {
      // some browsers require service worker for notifications
    }
  }, [state, todayMarked]);

  async function enable() {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      localStorage.setItem(STORAGE_KEY, "declined");
      setState("declined");
      setVisible(false);
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      localStorage.setItem(STORAGE_KEY, "enabled");
      setState("enabled");
      try {
        new Notification("MusterVoin", {
          body: "Готово. Буду напоминать вечером.",
          icon: "/icon.svg",
        });
      } catch {}
    } else {
      localStorage.setItem(STORAGE_KEY, "declined");
      setState("declined");
    }
    setVisible(false);
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