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

    return this.yinDetect(this.buffer, this.audioContext!.sampleRate);
  }

  private yinDetect(buffer: Float32Array, sampleRate: number): number | null {
    const halfSize = Math.floor(buffer.length / 2);
    const yinBuffer = new Float32Array(halfSize);

    // Min/max periods: human voice range ~80Hz to ~1000Hz
    const tauMin = Math.floor(sampleRate / 1000);
    const tauMax = Math.min(halfSize, Math.floor(sampleRate / 80));

    // Step 1 & 2: Difference function
    yinBuffer[0] = 1;
    let runningSum = 0;

    for (let tau = 1; tau < halfSize; tau++) {
      let diff = 0;
      for (let i = 0; i < halfSize; i++) {
        const delta = buffer[i] - buffer[i + tau];
        diff += delta * delta;
      }
      yinBuffer[tau] = diff;

      // Step 3: Cumulative mean normalized difference
      runningSum += diff;
      yinBuffer[tau] = runningSum > 0 ? (yinBuffer[tau] * tau) / runningSum : 1;
    }

    // Step 4: Absolute threshold (find first dip below threshold)
    const threshold = 0.15;
    let tauEstimate = -1;

    for (let tau = tauMin; tau < tauMax; tau++) {
      if (yinBuffer[tau] < threshold) {
        // Find local minimum
        while (tau + 1 < tauMax && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++;
        }
        tauEstimate = tau;
        break;
      }
    }

    if (tauEstimate === -1) {
      // No dip found below threshold, find global minimum in range
      let minVal = Infinity;
      for (let tau = tauMin; tau < tauMax; tau++) {
        if (yinBuffer[tau] < minVal) {
          minVal = yinBuffer[tau];
          tauEstimate = tau;
        }
      }
      // Only accept if reasonably low
      if (minVal > 0.4) return null;
    }

    // Step 5: Parabolic interpolation for sub-sample accuracy
    if (tauEstimate > 0 && tauEstimate < halfSize - 1) {
      const s0 = yinBuffer[tauEstimate - 1];
      const s1 = yinBuffer[tauEstimate];
      const s2 = yinBuffer[tauEstimate + 1];
      const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
      if (Math.abs(adjustment) < 1) {
        tauEstimate += adjustment;
      }
    }

    const frequency = sampleRate / tauEstimate;

    // Sanity check: human voice range
    if (frequency < 70 || frequency > 1100) return null;

    return frequency;
  }
}
