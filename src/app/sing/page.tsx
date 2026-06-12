"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import WaveAnimation from "@/components/WaveAnimation";
import ScoreCircle from "@/components/ScoreCircle";
import { getRandomNote, Note, frequencyToNote } from "@/lib/audio/notes";
import { playNoteWithTimbre } from "@/lib/audio/synth";
import { PitchDetector } from "@/lib/audio/pitch-detector";
import { calculateScore, ScoreResult } from "@/lib/scoring/score";
import { saveSessionResult } from "@/lib/storage";

type Phase = "ready" | "recording" | "correction" | "score";

export default function SingPage() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [targetNote, setTargetNote] = useState<Note>(() => getRandomNote(48, 72));
  const [detectedFreq, setDetectedFreq] = useState<number | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [roundCount, setRoundCount] = useState(0);

  const detectorRef = useRef<PitchDetector | null>(null);
  const frequenciesRef = useRef<number[]>([]);
  const animFrameRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    setPhase("recording");
    frequenciesRef.current = [];

    const detector = new PitchDetector();
    detectorRef.current = detector;
    await detector.start();

    const collectPitch = () => {
      const freq = detector.getFrequency();
      if (freq && freq > 50 && freq < 2000) {
        frequenciesRef.current.push(freq);
      }
      animFrameRef.current = requestAnimationFrame(collectPitch);
    };
    collectPitch();

    setTimeout(() => {
      stopRecording();
    }, 3000);
  }, []);

  const stopRecording = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (detectorRef.current) {
      detectorRef.current.stop();
      detectorRef.current = null;
    }

    const frequencies = frequenciesRef.current;
    if (frequencies.length > 0) {
      frequencies.sort((a, b) => a - b);
      const trimmed = frequencies.slice(
        Math.floor(frequencies.length * 0.1),
        Math.floor(frequencies.length * 0.9)
      );
      const avgFreq = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
      setDetectedFreq(avgFreq);

      const result = calculateScore(targetNote, avgFreq);
      setScoreResult(result);
      setPhase("correction");

      playNoteWithTimbre(targetNote.frequency, 3);
    } else {
      setDetectedFreq(null);
      setScoreResult({ score: 0, centsOff: 0, direction: "perfect", feedback: "Aucun son détecté" });
      setPhase("correction");
    }
  }, [targetNote]);

  const nextRound = useCallback(() => {
    if (scoreResult) {
      setSessionScores((prev) => [...prev, scoreResult.score]);
    }
    setRoundCount((prev) => prev + 1);
    setTargetNote(getRandomNote(48, 72));
    setDetectedFreq(null);
    setScoreResult(null);
    setPhase("ready");
  }, [scoreResult]);

  const finishSession = useCallback(() => {
    const allScores = scoreResult ? [...sessionScores, scoreResult.score] : sessionScores;
    saveSessionResult("sing", allScores);
    setPhase("score");
  }, [scoreResult, sessionScores]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (detectorRef.current) {
        detectorRef.current.stop();
      }
    };
  }, []);

  const avgScore = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : scoreResult?.score ?? 0;

  return (
    <>
      <Header />
      <div className="pt-6">
        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide font-medium">
                  Note à chanter
                </p>
                <p className="note-display">{targetNote.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">({targetNote.nameEn})</p>
              </div>

              <p className="text-sm text-[var(--text-secondary)]">Chantez cette note, à n&apos;importe quelle octave</p>

              <button onClick={startRecording} className="btn-primary text-lg px-10 py-4">
                <span className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  </svg>
                  Chanter
                </span>
              </button>

              {roundCount > 0 && (
                <p className="text-xs text-[var(--text-secondary)]">
                  Round {roundCount + 1} — Score moyen : {avgScore}%
                </p>
              )}
            </motion.div>
          )}

          {phase === "recording" && (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide font-medium">
                  Chant en cours
                </p>
                <p className="note-display">{targetNote.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">({targetNote.nameEn})</p>
              </div>

              <WaveAnimation isActive={true} />

              <p className="text-[var(--text-secondary)]">Enregistrement en cours...</p>

              <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
                <motion.div
                  className="w-2 h-2 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                3s
              </div>
            </motion.div>
          )}

          {phase === "correction" && scoreResult && (
            <motion.div
              key="correction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 text-center"
            >
              <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide font-medium">
                Correction
              </p>

              <div className="card space-y-4">
                <div className="flex justify-center gap-8">
                  <div className="space-y-1 text-center">
                    <p className="text-xs text-[var(--text-secondary)]">Demandée</p>
                    <p className="text-3xl font-bold">{targetNote.name}</p>
                  </div>
                  {detectedFreq && (
                    <div className="space-y-1 text-center">
                      <p className="text-xs text-[var(--text-secondary)]">Chantée</p>
                      <p className="text-3xl font-bold">{frequencyToNote(detectedFreq).name}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    scoreResult.score >= 85 ? "bg-green-500" :
                    scoreResult.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                  }`} />
                  <span className="font-medium">{scoreResult.feedback}</span>
                </div>

                {scoreResult.score >= 65 && scoreResult.direction !== "perfect" && (
                  <p className="text-sm text-[var(--text-secondary)]">
                    Justesse : {Math.abs(scoreResult.centsOff)} cents {scoreResult.direction === "sharp" ? "au-dessus" : "en-dessous"}
                  </p>
                )}
              </div>

              <WaveAnimation isActive={false} />

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
                {avgScore >= 85 ? "Félicitations !" :
                 avgScore >= 60 ? "Bien joué !" : "Continuez à pratiquer !"}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {sessionScores.length} round{sessionScores.length > 1 ? "s" : ""} complété{sessionScores.length > 1 ? "s" : ""}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setSessionScores([]);
                    setRoundCount(0);
                    setTargetNote(getRandomNote(48, 72));
                    setPhase("ready");
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
