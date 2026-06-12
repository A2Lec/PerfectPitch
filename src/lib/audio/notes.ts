export const NOTE_NAMES = [
  "Do", "Do#", "Ré", "Ré#", "Mi", "Fa",
  "Fa#", "Sol", "Sol#", "La", "La#", "Si",
] as const;

export const NOTE_NAMES_EN = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export interface Note {
  name: NoteName;
  nameEn: string;
  frequency: number;
  octave: number;
  midi: number;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440);
}

export function frequencyToNote(frequency: number): Note {
  const midi = Math.round(frequencyToMidi(frequency));
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return {
    name: NOTE_NAMES[noteIndex],
    nameEn: NOTE_NAMES_EN[noteIndex],
    frequency: midiToFrequency(midi),
    octave,
    midi,
  };
}

export function generateNoteSet(startMidi: number = 48, endMidi: number = 72): Note[] {
  const notes: Note[] = [];
  for (let midi = startMidi; midi <= endMidi; midi++) {
    const noteIndex = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;
    notes.push({
      name: NOTE_NAMES[noteIndex],
      nameEn: NOTE_NAMES_EN[noteIndex],
      frequency: midiToFrequency(midi),
      octave,
      midi,
    });
  }
  return notes;
}

export function getRandomNote(startMidi: number = 48, endMidi: number = 72): Note {
  const midi = Math.floor(Math.random() * (endMidi - startMidi + 1)) + startMidi;
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return {
    name: NOTE_NAMES[noteIndex],
    nameEn: NOTE_NAMES_EN[noteIndex],
    frequency: midiToFrequency(midi),
    octave,
    midi,
  };
}
