let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

export function playNote(frequency: number, duration: number = 1.5): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02);
    gainNode.gain.setValueAtTime(0.5, now + duration - 0.2);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
      resolve();
    };
  });
}

export function playNoteWithTimbre(frequency: number, duration: number = 1.5): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const fundamental = ctx.createOscillator();
    const harmonic2 = ctx.createOscillator();
    const harmonic3 = ctx.createOscillator();

    const masterGain = ctx.createGain();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const gain3 = ctx.createGain();

    fundamental.type = "sine";
    fundamental.frequency.value = frequency;
    gain1.gain.value = 1.0;

    harmonic2.type = "sine";
    harmonic2.frequency.value = frequency * 2;
    gain2.gain.value = 0.12;

    harmonic3.type = "sine";
    harmonic3.frequency.value = frequency * 3;
    gain3.gain.value = 0.05;

    // Envelope
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.35, now + 0.03);
    masterGain.gain.setValueAtTime(0.35, now + duration - 0.3);
    masterGain.gain.linearRampToValueAtTime(0, now + duration);

    fundamental.connect(gain1);
    harmonic2.connect(gain2);
    harmonic3.connect(gain3);
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    gain3.connect(masterGain);
    masterGain.connect(ctx.destination);

    fundamental.start(now);
    harmonic2.start(now);
    harmonic3.start(now);
    fundamental.stop(now + duration);
    harmonic2.stop(now + duration);
    harmonic3.stop(now + duration);

    fundamental.onended = () => {
      fundamental.disconnect();
      harmonic2.disconnect();
      harmonic3.disconnect();
      gain1.disconnect();
      gain2.disconnect();
      gain3.disconnect();
      masterGain.disconnect();
      resolve();
    };
  });
}
