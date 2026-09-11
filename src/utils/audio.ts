// Web Audio API Sound Synthesizer (Zero asset dependency, instant playback)

class SoundFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check localStorage preference
    const saved = localStorage.getItem('geopuzzle_muted');
    this.isMuted = saved === 'true';
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
      return null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('geopuzzle_muted', String(this.isMuted));
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Pleasant snapping bell chime
  public playSnapSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Double-harmonic chime (Fundamental + Fifth)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1046.5, now); // C6
      osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15); // E6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (err) {
      console.warn('Error playing snap chime:', err);
    }
  }

  // Shuffle swoosh sound
  public playShuffleSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (err) {
      console.warn('Error playing shuffle sound:', err);
    }
  }

  // Hint radar sound
  public playHintSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (err) {
      console.warn('Error playing hint sound:', err);
    }
  }

  // Victory fanfare sequence
  public playVictoryFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.0, dur: 0.12 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.12 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.12 }, // G5
        { freq: 1046.5, time: 0.36, dur: 0.45 }, // C6
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        gain.gain.setValueAtTime(0.2, now + n.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
      });
    } catch (err) {
      console.warn('Error playing victory fanfare:', err);
    }
  }
}

export const sound = new SoundFX();
