"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import WaveAnimation from "@/components/WaveAnimation";
import ScoreCircle from "@/components/ScoreCircle";
import NoteButton from "@/components/NoteButton";
import { getRandomNote, Note, NOTE_NAMES } from "@/lib/audio/notes";
import { playNoteWithTimbre } from "@/lib/audio/synth";
import { saveSessionResult } from "@/lib/storage";

type Phase = "listen" | "guess" | "result" | "score";

export default function ListenPage() {
  const [phase, setPhase] = useState<Phase>("listen");
  const [targetNote, setTargetNote] = useState<Note>(() => getRandomNote(48, 72));
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [roundCount, setRoundCount] = useState(0);

  const playCurrentNote = useCallback(async () => {
    setIsPlaying(true);
    await playNoteWithTimbre(targetNote.frequency, 2);
    setIsPlaying(false);
    setPhase("guess");
  }, [targetNote]);

  const handleGuess = useCallback((noteName: string) => {
    setSelectedNote(noteName);
    const correct = noteName === targetNote.name;
    setIsCorrect(correct);
    setSessionScores((prev) => [...prev, correct ? 100 : 0]);
    setPhase("result");
  }, [targetNote]);

  const nextRound = useCallback(() => {
    setRoundCount((prev) => prev + 1);
    setTargetNote(getRandomNote(48, 72));
    setSelectedNote(null);
    setIsCorrect(null);
    setPhase("listen");
  }, []);

  const finishSession = useCallback(() => {
    saveSessionResult("listen", sessionScores);
    setPhase("score");
  }, [sessionScores]);

  const avgScore = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : 0;

  return (
    <>
      <Header />
      <div className="pt-6">
        <AnimatePresence mode="wait">
          {phase === "listen" && (
            <motion.div
              key="listen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide font-medium">
                  Mode écoute
                </p>
                <p className="text-lg text-[var(--text-secondary)]">
                  Écoutez la note et identifiez-la
                </p>
              </div>

              <WaveAnimation isActive={isPlaying} />

              <button onClick={playCurrentNote} className="btn-primary text-lg px-10 py-4" disabled={isPlaying}>
                <span className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  {isPlaying ? "Lecture..." : "Écouter"}
                </span>
              </button>

              {roundCount > 0 && (
                <p className="text-xs text-[var(--text-secondary)]">
                  Round {roundCount + 1} — Score : {avgScore}%
                </p>
              )}
            </motion.div>
          )}

          {phase === "guess" && (
            <motion.div
              key="guess"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide font-medium">
                  Quelle note avez-vous entendue ?
                </p>
              </div>

              <button
                onClick={playCurrentNote}
                className="btn-secondary text-sm"
                disabled={isPlaying}
              >
                Réécouter
              </button>

              <div className="grid grid-cols-4 gap-2">
                {NOTE_NAMES.map((name) => (
                  <NoteButton
                    key={name}
                    note={name}
                    onClick={() => handleGuess(name)}
                    disabled={false}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 text-center"
            >
              <div className={`card ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                    isCorrect ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {isCorrect ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34a853" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    )}
                  </div>

                  <p className="text-xl font-bold">
                    {isCorrect ? "Correct !" : "Pas tout à fait..."}
                  </p>

                  {!isCorrect && (
                    <div className="space-y-1">
                      <p className="text-sm text-[var(--text-secondary)]">
                        Vous avez choisi : <strong>{selectedNote}</strong>
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        La bonne réponse : <strong>{targetNote.name}</strong>
                      </p>
                    </div>
                  )}

                  <p className="text-lg font-semibold">{targetNote.name} ({Math.round(targetNote.frequency)} Hz)</p>
                </div>
              </div>

              <button
                onClick={() => playNoteWithTimbre(targetNote.frequency, 2)}
                className="btn-secondary text-sm"
              >
                Réécouter la note
              </button>

              <div className="flex gap-3 justify-center">
                <button onClick={nextRound} className="btn-primary">
                  Suivant
                </button>
                <button onClick={finishSession} className="btn-secondary">
                  Terminer
                </button>
              </div>
            </motion.div>
          )}

          {phase === "score" && (
            <motion.div
              key="score"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide font-medium">
                Score de la session
              </p>

              <div className="flex justify-center">
                <ScoreCircle score={avgScore} size={160} />
              </div>

              <p className="text-lg font-medium">
                {avgScore >= 85 ? "Excellente oreille !" :
                 avgScore >= 60 ? "Bien joué !" : "Continuez à pratiquer !"}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {sessionScores.filter((s) => s === 100).length}/{sessionScores.length} bonnes réponses
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setSessionScores([]);
                    setRoundCount(0);
                    setTargetNote(getRandomNote(48, 72));
                    setSelectedNote(null);
                    setIsCorrect(null);
                    setPhase("listen");
                  }}
                  className="btn-primary"
                >
                  Recommencer
                </button>
                <a href="/" className="btn-secondary">
                  Accueil
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
