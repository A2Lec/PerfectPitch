"use client";

import { motion } from "framer-motion";

interface PitchMeterProps {
  centsOff: number;
  direction: "sharp" | "flat" | "perfect";
  targetName: string;
  detectedName: string;
  isCorrectNote: boolean;
}

export default function PitchMeter({ centsOff, direction, targetName, detectedName, isCorrectNote }: PitchMeterProps) {
  // Clamp display to ±100 cents (1 semitone)
  const clampedCents = Math.max(-100, Math.min(100, centsOff));
  // Position: 0 = center, -50% to +50%
  const position = (clampedCents / 100) * 50;

  const getIndicatorColor = () => {
    const absCents = Math.abs(centsOff);
    if (!isCorrectNote) return "#ea4335";
    if (absCents <= 10) return "#34a853";
    if (absCents <= 30) return "#fbbc04";
    return "#ea4335";
  };

  return (
    <div className="space-y-4">
      {/* Note comparison */}
      <div className="flex justify-center items-end gap-6">
        <div className="text-center">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Demandée</p>
          <p className="text-4xl font-bold text-[var(--text)]">{targetName}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Chantée</p>
          <motion.p
            className="text-4xl font-bold"
            style={{ color: getIndicatorColor() }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {detectedName}
          </motion.p>
        </div>
      </div>

      {/* Pitch gauge - only show if correct note (cents matter) */}
      {isCorrectNote && (
        <div className="space-y-2">
          <div className="relative h-10 flex items-center">
            {/* Background track */}
            <div className="absolute inset-x-0 h-2 rounded-full bg-gray-100 overflow-hidden">
              {/* Colored zones */}
              <div className="absolute inset-y-0 left-[35%] right-[35%] bg-green-100" />
              <div className="absolute inset-y-0 left-[20%] right-[60%] bg-yellow-50" />
              <div className="absolute inset-y-0 left-[60%] right-[20%] bg-yellow-50" />
            </div>

            {/* Center target line */}
            <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-6 bg-[var(--primary)] rounded-full" />

            {/* Indicator dot */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md border-2 border-white"
              style={{ backgroundColor: getIndicatorColor() }}
              initial={{ left: "50%" }}
              animate={{ left: `${50 + position}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
            />
          </div>

          {/* Scale labels */}
          <div className="flex justify-between text-[10px] text-[var(--text-secondary)] px-1">
            <span>-100¢</span>
            <span>-50¢</span>
            <span className="font-medium text-[var(--primary)]">Juste</span>
            <span>+50¢</span>
            <span>+100¢</span>
          </div>

          {/* Cents readout */}
          <motion.p
            className="text-center text-sm font-medium"
            style={{ color: getIndicatorColor() }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {direction === "perfect" ? "Parfaitement juste" :
              `${Math.abs(centsOff)} cents trop ${direction === "sharp" ? "haut" : "bas"}`}
          </motion.p>
        </div>
      )}

      {/* Wrong note message */}
      {!isCorrectNote && (
        <motion.p
          className="text-center text-sm text-[var(--error)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Mauvaise note — écoutez bien la correction
        </motion.p>
      )}
    </div>
  );
}
