"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { getProgress, UserProgress } from "@/lib/storage";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!progress) {
    return (
      <>
        <Header />
        <div className="pt-8 text-center text-[var(--text-secondary)]">Chargement...</div>
      </>
    );
  }

  const chartData = progress.history.map((record) => {
    const allScores = [...record.singScores, ...record.listenScores];
    const avg = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;
    return {
      date: new Date(record.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      score: avg,
      sing: record.singScores.length > 0
        ? Math.round(record.singScores.reduce((a, b) => a + b, 0) / record.singScores.length)
        : null,
      listen: record.listenScores.length > 0
        ? Math.round(record.listenScores.reduce((a, b) => a + b, 0) / record.listenScores.length)
        : null,
    };
  });

  const totalSingRounds = progress.history.reduce((sum, r) => sum + r.singScores.length, 0);
  const totalListenRounds = progress.history.reduce((sum, r) => sum + r.listenScores.length, 0);

  return (
    <>
      <Header />
      <div className="pt-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold">Progression</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="card text-center p-4">
            <p className="text-2xl font-bold text-[var(--primary)]">{progress.streak}</p>
            <p className="text-xs text-[var(--text-secondary)]">Jours consécutifs</p>
          </div>
          <div className="card text-center p-4">
            <p className="text-2xl font-bold text-[var(--accent)]">{progress.totalSessions}</p>
            <p className="text-xs text-[var(--text-secondary)]">Sessions</p>
          </div>
          <div className="card text-center p-4">
            <p className="text-2xl font-bold text-[var(--primary)]">{progress.bestScore}%</p>
            <p className="text-xs text-[var(--text-secondary)]">Meilleur score</p>
          </div>
        </motion.div>

        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="font-semibold mb-4">Évolution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Score moyen"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card space-y-3"
        >
          <h2 className="font-semibold">Statistiques</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Rounds chantés</span>
              <span className="font-medium">{totalSingRounds}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Rounds écoutés</span>
              <span className="font-medium">{totalListenRounds}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Total rounds</span>
              <span className="font-medium">{totalSingRounds + totalListenRounds}</span>
            </div>
          </div>
        </motion.div>

        {chartData.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-[var(--text-secondary)]"
          >
            <p className="text-lg mb-2">Pas encore de données</p>
            <p className="text-sm">Commencez un entraînement pour voir votre progression !</p>
          </motion.div>
        )}
      </div>
    </>
  );
}
