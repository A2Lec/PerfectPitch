let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
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
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime + duration - 0.3);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);

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
    const fundamental = ctx.createOscillator();
    const harmonic2 = ctx.createOscillator();
    const harmonic3 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const gain2 = ctx.createGain();
    const gain3 = ctx.createGain();

    fundamental.type = "sine";
    fundamental.frequency.setValueAtTime(frequency, ctx.currentTime);

    harmonic2.type = "sine";
    harmonic2.frequency.setValueAtTime(frequency * 2, ctx.currentTime);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime);

    harmonic3.type = "sine";
    harmonic3.frequency.setValueAtTime(frequency * 3, ctx.currentTime);
    gain3.gain.setValueAtTime(0.07, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime + duration - 0.4);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    fundamental.connect(gainNode);
    harmonic2.connect(gain2);
    gain2.connect(gainNode);
    harmonic3.connect(gain3);
    gain3.connect(gainNode);
    gainNode.connect(ctx.destination);

    fundamental.start(ctx.currentTime);
    harmonic2.start(ctx.currentTime);
    harmonic3.start(ctx.currentTime);
    fundamental.stop(ctx.currentTime + duration);
    harmonic2.stop(ctx.currentTime + duration);
    harmonic3.stop(ctx.currentTime + duration);

    fundamental.onended = () => {
      fundamental.disconnect();
      harmonic2.disconnect();
      harmonic3.disconnect();
      gainNode.disconnect();
      gain2.disconnect();
      gain3.disconnect();
      resolve();
    };
  });
}
