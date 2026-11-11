import { VoiceEngineType, VoiceProsodyConfig } from '../types';
class AudioService {
  private ctx: AudioContext | null = null;
  private bgmOsc: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private voicesLoaded: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  constructor() {
    this.initVoices();
  }
  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const load = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
        if (this.cachedVoices.length > 0) {
          this.voicesLoaded = true;
        }
      };
      load();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = load;
      }
    }
  }
  public initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }
  playClick() {
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (_) {}
  }
  playCutSound() {
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  }
  /**
   * Synthesize a melodic acoustic vocal preview through Web Audio oscillators
   * Used as an audible fallback if browser speech synthesis voice engine is muted or blocked.
   */
  private playFallbackVocalAudition(
    text: string,
    persona?: VoiceEngineType,
    prosody?: VoiceProsodyConfig,
    onEnd?: () => void
  ) {
    try {
      const ctx = this.initCtx();
      const femalePersonas: VoiceEngineType[] = ['capella', 'callisto', 'bellatrix', 'leda'];
      const isFemale = femalePersonas.includes(persona || 'capella');
      const baseFreq = isFemale ? 220 : 130;
      const pitchMod = prosody?.pitchModulation || 1.0;
      const rateMod = prosody?.rateModulation || 1.0;
      const words = text.split(/\s+/).slice(0, 15);
      const noteDuration = Math.max(0.12, 0.22 / rateMod);
      const startTime = ctx.currentTime + 0.05;
      const melodyPitches = [1, 1.12, 1.25, 1.33, 1.5, 1.25, 1.12, 1.0];
      words.forEach((_, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const step = melodyPitches[idx % melodyPitches.length];
        const freq = baseFreq * step * pitchMod;
        const noteStart = startTime + idx * noteDuration;
        osc.type = isFemale ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteStart);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, noteStart + noteDuration);
        // Vocal formant filter simulation
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(isFemale ? 1100 : 750, noteStart);
        filter.Q.setValueAtTime(3.5, noteStart);
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration - 0.01);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
      const totalLenMs = (startTime - ctx.currentTime + words.length * noteDuration) * 1000;
      setTimeout(() => {
        onEnd?.();
      }, totalLenMs);
    } catch (_) {
      onEnd?.();
    }
  }
  // Web Speech API speech synthesis with automatic fallback and AudioContext unlocking
  speakNarration(
    text: string,
    persona?: VoiceEngineType,
    voiceURI?: string,
    prosody?: VoiceProsodyConfig,
    onEnd?: () => void
  ) {
    // 1. Unmute/Resume AudioContext on user interaction
    this.initCtx();
    if (!text || !text.trim()) {
      onEnd?.();
      return;
    }
    if (!('speechSynthesis' in window)) {
      this.playFallbackVocalAudition(text, persona, prosody, onEnd);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      // Resume in case speech synthesis was paused by the browser
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      let voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        voices = this.cachedVoices;
      }
      if (voiceURI) {
        const found = voices.find((v) => v.voiceURI === voiceURI);
        if (found) utterance.voice = found;
      } else {
        const femalePersonas: VoiceEngineType[] = ['capella', 'callisto', 'bellatrix', 'leda'];
        const wantsFemale = femalePersonas.includes(persona || 'capella');
        const best = wantsFemale ? this.getBestFemaleVoice() : this.getBestMaleVoice();
        if (best) utterance.voice = best;
      }
      if (prosody) {
        utterance.rate = Math.max(0.6, Math.min(1.8, prosody.rateModulation || 1.0));
        utterance.pitch = Math.max(0.6, Math.min(1.8, prosody.pitchModulation || 1.0));
      } else {
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
      }
      utterance.volume = 1.0;
      let hasFiredEnd = false;
      const finish = () => {
        if (!hasFiredEnd) {
          hasFiredEnd = true;
          onEnd?.();
        }
      };
      utterance.onend = finish;
      utterance.onerror = (e) => {
        console.warn('Speech synthesis note:', e);
        // Fallback to synthesized vocal notes if browser synthetic voice fails
        this.playFallbackVocalAudition(text, persona, prosody, finish);
      };
      // Workaround for Chrome/WebKit bug where utterance stops unexpectedly
      const watchdog = setTimeout(() => {
        if (!hasFiredEnd && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 5000);
      const originalOnEnd = utterance.onend;
      utterance.onend = (e) => {
        clearTimeout(watchdog);
        if (typeof originalOnEnd === 'function') {
          originalOnEnd.call(utterance, e);
        }
      };
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error, falling back to oscillator audition:', err);
      this.playFallbackVocalAudition(text, persona, prosody, onEnd);
    }
  }
  stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
  }
  getBestFemaleVoice(): SpeechSynthesisVoice | null {
    if (!('speechSynthesis' in window)) return null;
    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) voices = this.cachedVoices;
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const female = englishVoices.find((v) =>
      /female|samantha|victoria|zira|karen|susan|fiona|moira|tessa|ava|allison|serena/i.test(v.name)
    );
    return female || englishVoices[0] || voices[0] || null;
  }
  getBestMaleVoice(): SpeechSynthesisVoice | null {
    if (!('speechSynthesis' in window)) return null;
    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) voices = this.cachedVoices;
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const male = englishVoices.find((v) =>
      /male|david|alex|daniel|george|tom|oliver|rishi|guy|brian|arthur/i.test(v.name)
    );
    return male || englishVoices[1] || englishVoices[0] || voices[0] || null;
  }
  playAtmosphereSFX(description: string, durationSec = 3.0) {
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + durationSec);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch (_) {}
  }
  playSceneMusicDirection(direction: string, genre = 'cyber_synth', durationSec = 3.5) {
    try {
      const ctx = this.initCtx();
      const chordNotes = [220, 277.18, 329.63]; // A major
      chordNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + durationSec);
      });
    } catch (_) {}
  }
  playBGM(genre: string) {
    this.stopBGM();
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const rootFreq = genre.includes('dark') ? 110 : genre.includes('epic') ? 146.83 : 130.81;
      osc.frequency.setValueAtTime(rootFreq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      this.bgmOsc = osc;
      this.bgmGain = gain;
    } catch (_) {}
  }
  stopBGM() {
    try {
      if (this.bgmOsc) {
        this.bgmOsc.stop();
        this.bgmOsc.disconnect();
        this.bgmOsc = null;
      }
      if (this.bgmGain) {
        this.bgmGain.disconnect();
        this.bgmGain = null;
      }
    } catch (_) {}
  }
  /**
   * Generates a valid uncompressed WAV file (PCM 16-bit 44.1kHz mono) for soundtrack muxing in FFmpeg
   */
  generateAudioTrackWav(
    durationSec: number,
    genre: string,
    options?: {
      hasHighEnergyIntro?: boolean;
      voiceEmphasisTone?: boolean;
      hookPitchMultiplier?: number;
    }
  ): Uint8Array {
    const sampleRate = 44100;
    const clampedSec = Math.min(180, Math.max(1, durationSec));
    const numSamples = Math.floor(sampleRate * clampedSec);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);
    const baseFreq = genre.includes('dark') ? 110 : genre.includes('epic') ? 146.83 : 130.81;
    const pitchMultiplier = options?.hookPitchMultiplier || 1.0;
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const freq = t < 3 ? baseFreq * pitchMultiplier : baseFreq;
      const wave =
        Math.sin(2 * Math.PI * freq * t) * 0.4 +
        Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.25 +
        Math.sin(2 * Math.PI * 4 * t) * 0.1;
      const fadeIn = Math.min(1, t / 0.5);
      const fadeOut = Math.min(1, (clampedSec - t) / 0.8);
      const sample = Math.max(-1, Math.min(1, wave * fadeIn * fadeOut));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
    return new Uint8Array(buffer);
  }
}
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
export const audioService = new AudioService();
export const audioSynth = audioService;
