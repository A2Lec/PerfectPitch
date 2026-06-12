export class PitchDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private buffer: Float32Array<ArrayBuffer> = new Float32Array(0);
  private isListening = false;

  async start(): Promise<void> {
    this.audioContext = new AudioContext();
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 4096;
    this.source.connect(this.analyser);
    this.buffer = new Float32Array(this.analyser.fftSize) as Float32Array<ArrayBuffer>;
    this.isListening = true;
  }

  stop(): void {
    this.isListening = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }

  getFrequency(): number | null {
    if (!this.analyser || !this.isListening) return null;

    this.analyser.getFloatTimeDomainData(this.buffer);

    let rms = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      rms += this.buffer[i] * this.buffer[i];
    }
    rms = Math.sqrt(rms / this.buffer.length);
    if (rms < 0.01) return null;

    return this.autocorrelate(this.buffer, this.audioContext!.sampleRate);
  }

  private autocorrelate(buffer: Float32Array, sampleRate: number): number | null {
    const size = buffer.length;
    const correlations = new Float32Array(size);

    let foundGoodCorrelation = false;
    let bestOffset = -1;
    let bestCorrelation = 0;
    let lastCorrelation = 1;

    for (let offset = 0; offset < size; offset++) {
      let correlation = 0;
      let norm1 = 0;
      let norm2 = 0;

      for (let i = 0; i < size - offset; i++) {
        correlation += buffer[i] * buffer[i + offset];
        norm1 += buffer[i] * buffer[i];
        norm2 += buffer[i + offset] * buffer[i + offset];
      }

      const normalizer = Math.sqrt(norm1 * norm2);
      correlation = normalizer > 0 ? correlation / normalizer : 0;
      correlations[offset] = correlation;

      if (offset > sampleRate / 1000) {
        if (correlation > 0.9 && correlation > lastCorrelation) {
          foundGoodCorrelation = true;
          if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
          }
        } else if (foundGoodCorrelation) {
          break;
        }
      }
      lastCorrelation = correlation;
    }

    if (bestCorrelation > 0.9 && bestOffset > 0) {
      // Parabolic interpolation for better precision
      const prev = correlations[bestOffset - 1];
      const curr = correlations[bestOffset];
      const next = correlations[bestOffset + 1];
      const shift = (next - prev) / (2 * (2 * curr - next - prev));
      return sampleRate / (bestOffset + shift);
    }

    return null;
  }
}
