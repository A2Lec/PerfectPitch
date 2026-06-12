"use client";

import { motion } from "framer-motion";

interface NoteButtonProps {
  note: string;
  isSelected?: boolean;
  isCorrect?: boolean | null;
  onClick: () => void;
  disabled?: boolean;
}

export default function NoteButton({ note, isSelected, isCorrect, onClick, disabled }: NoteButtonProps) {
  let bgColor = "bg-white border-gray-200";
  if (isSelected && isCorrect === true) bgColor = "bg-green-50 border-green-400";
  else if (isSelected && isCorrect === false) bgColor = "bg-red-50 border-red-400";
  else if (isSelected) bgColor = "bg-[var(--primary-light)] border-[var(--primary)]";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`${bgColor} border-2 rounded-xl px-4 py-3 font-semibold text-center
                  transition-colors disabled:opacity-50 min-w-[60px]`}
    >
      {note}
    </motion.button>
  );
}
