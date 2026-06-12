"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { getProgress } from "@/lib/storage";
import { isNotificationSupported, requestNotificationPermission, scheduleDaily } from "@/lib/notifications/push";

export default function Home() {
  const [streak, setStreak] = useState(0);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(false);

  useEffect(() => {
    const progress = getProgress();
    setStreak(progress.streak);

    if (isNotificationSupported()) {
      if (Notification.permission === "granted") {
        setNotifEnabled(true);
      } else if (Notification.permission !== "denied") {
        setShowNotifBanner(true);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotifEnabled(true);
      setShowNotifBanner(false);
      scheduleDaily();
    }
  };

  return (
    <>
      <Header />
      <div className="pt-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-2xl font-bold">Entraînez votre oreille</h1>
          <p className="text-[var(--text-secondary)]">
            Choisissez votre mode d&apos;exercice
          </p>
          {streak > 0 && (
            <p className="text-sm text-[var(--accent)] font-medium">
              {streak} jour{streak > 1 ? "s" : ""} consécutif{streak > 1 ? "s" : ""}
            </p>
          )}
        </motion.div>

        <div className="grid gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/sing" className="card flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Chanter</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Une note s&apos;affiche, chantez-la
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/listen" className="card flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Écouter</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Écoutez une note, identifiez-la
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          </motion.div>
        </div>

        {showNotifBanner && !notifEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="card text-center space-y-3"
          >
            <p className="text-sm text-[var(--text-secondary)]">
              Activez les rappels pour ne jamais manquer un entraînement
            </p>
            <button onClick={handleEnableNotifications} className="btn-secondary text-sm">
              Activer les notifications
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}
