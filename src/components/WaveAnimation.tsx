"use client";

import { motion } from "framer-motion";

interface WaveAnimationProps {
  isActive: boolean;
  color?: string;
}

export default function WaveAnimation({ isActive, color = "#1a73e8" }: WaveAnimationProps) {
  return (
    <div className="flex items-center justify-center h-20 gap-1">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={
            isActive
              ? {
                  height: [8, Math.random() * 60 + 10, 8],
                  opacity: [0.4, 1, 0.4],
                }
              : { height: 8, opacity: 0.3 }
          }
          transition={
            isActive
              ? {
                  duration: 0.6 + Math.random() * 0.4,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}
