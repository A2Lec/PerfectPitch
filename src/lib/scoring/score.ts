import { frequencyToNote, type Note } from "@/lib/audio/notes";

export interface ScoreResult {
  score: number;
  centsOff: number;
  direction: "sharp" | "flat" | "perfect";
  feedback: string;
}

export function calculateScore(targetNote: Note, detectedFrequency: number): ScoreResult {
  const detectedNote = frequencyToNote(detectedFrequency);

  const targetSemitone = targetNote.midi % 12;
  const detectedSemitone = detectedNote.midi % 12;

  // Cents offset within the same note name (ignore octave)
  // Normalize detected frequency to the same octave as target
  const octaveDiff = Math.round(Math.log2(detectedFrequency / targetNote.frequency));
  const normalizedFreq = detectedFrequency / Math.pow(2, octaveDiff);
  const centsOff = 1200 * Math.log2(normalizedFreq / targetNote.frequency);
  const absCents = Math.abs(centsOff);

  // If the note name matches (any octave), score based on precision
  const nameMatches = targetSemitone === detectedSemitone;

  let score: number;
  if (nameMatches) {
    if (absCents <= 5) score = 100;
    else if (absCents <= 10) score = 95;
    else if (absCents <= 20) score = 90;
    else if (absCents <= 30) score = 85;
    else if (absCents <= 50) score = 75;
    else score = 65;
  } else {
    // Wrong note name — score based on semitone distance
    let semitoneDist = Math.abs(targetSemitone - detectedSemitone);
    if (semitoneDist > 6) semitoneDist = 12 - semitoneDist;

    if (semitoneDist === 1) score = 40;
    else if (semitoneDist === 2) score = 25;
    else score = Math.max(0, 15 - semitoneDist * 2);
  }

  let direction: "sharp" | "flat" | "perfect";
  if (absCents <= 5 && nameMatches) direction = "perfect";
  else if (centsOff > 0) direction = "sharp";
  else direction = "flat";

  let feedback: string;
  if (score >= 95) feedback = "Parfait !";
  else if (score >= 85) feedback = "Excellent !";
  else if (score >= 75) feedback = "Très bien !";
  else if (score >= 60) feedback = "Bonne note, affinez !";
  else if (score >= 40) feedback = "Presque, persévérez !";
  else feedback = "Continuez à pratiquer !";

  return { score: Math.round(score), centsOff: Math.round(centsOff), direction, feedback };
}

export interface SessionStats {
  totalRounds: number;
  correctAnswers: number;
  averageScore: number;
  scores: number[];
}

export function calculateSessionStats(scores: number[]): SessionStats {
  const totalRounds = scores.length;
  const correctAnswers = scores.filter((s) => s >= 75).length;
  const averageScore = totalRounds > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalRounds) : 0;
  return { totalRounds, correctAnswers, averageScore, scores };
}
