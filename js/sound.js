// Web Audio Synthesizer and Text-to-Speech Engine
// Ensures 100% offline capability without external MP3 files

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.voiceLanguage = 'hi-IN'; // default Hindi for India healthcare context
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Hospital Announcement Bell (Ding-Dong chime: C5 -> E5 -> G5)
  playHospitalChime() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.22);

        gain.gain.setValueAtTime(0, now + index * 0.22);
        gain.gain.linearRampToValueAtTime(0.25, now + index * 0.22 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.22 + 0.7);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + index * 0.22);
        osc.stop(now + index * 0.22 + 0.8);
      });
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }

  // Token Generated Beep (Positive double-ping)
  playSuccessSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [587.33, 880.00]; // D5, A5

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.36);
      });
    } catch (e) {
      console.warn("Success sound error:", e);
    }
  }

  // Payment Coin Clink Sound
  playCoinSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1); // E6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch (e) {
      console.warn("Coin sound error:", e);
    }
  }

  // Emergency Siren Tone
  playEmergencyTone() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.2);
      osc.frequency.linearRampToValueAtTime(400, now + 0.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn("Emergency sound error:", e);
    }
  }

  // Text to Speech for illiterate users
  speak(text, lang = 'hi-IN') {
    if (!this.synth) return;

    try {
      // Cancel previous speech if speaking
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.92; // Slightly slower for clarity
      utterance.pitch = 1.0;

      // Try finding Hindi or Indian English voice if available
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        const matchedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0])) ||
          voices.find(v => v.lang.includes('IN') || v.lang.includes('hi'));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("TTS Error:", e);
    }
  }

  // Helper for Hindi voice
  speakHindi(text) {
    this.speak(text, 'hi-IN');
  }

  // Helper for English voice
  speakEnglish(text) {
    this.speak(text, 'en-IN');
  }

  stopVoice() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

// Global instance
window.sound = new SoundEngine();
