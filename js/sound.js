// Web Audio Synthesizer and Text-to-Speech Engine
// Ensures 100% offline capability without external MP3 files

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.voiceLanguage = 'hi-IN'; // default Hindi for India healthcare context
    this.isRinging = false;
    this.ringtoneTimeouts = [];
    this.activeOscillators = [];
    this.ringtoneMasterGain = null;

    // Auto unlock on first user gesture anywhere
    const unlock = () => {
      this.initAudio();
      if (typeof document !== 'undefined') {
        document.removeEventListener('pointerdown', unlock);
        document.removeEventListener('keydown', unlock);
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('pointerdown', unlock, { once: true });
      document.addEventListener('keydown', unlock, { once: true });
    }
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

  // Incoming Online Booking Ringtone (Simulates Hospital Reception Desk Phone / Counter Ring)
  // Double-ring chime sequence: [Ring 320ms - Gap 100ms - Ring 320ms] ... repeated 3 times
  playIncomingBookingRingtone(tokenNumber = null, patientName = null, withVoice = true) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      this.stopIncomingRingtone(); // Stop any active ringing first
      this.isRinging = true;

      const now = this.audioCtx.currentTime;
      this.ringtoneMasterGain = this.audioCtx.createGain();
      this.ringtoneMasterGain.connect(this.audioCtx.destination);
      this.ringtoneMasterGain.gain.setValueAtTime(0.35, now);

      // Play 3 double-ring cycles (approx 5.2 seconds total)
      const ringCycles = 3;
      const cadencePeriod = 1.65; // seconds per cycle

      for (let c = 0; c < ringCycles; c++) {
        const cycleStart = now + c * cadencePeriod;
        // Ring burst 1
        this._scheduleRingBurst(cycleStart, 0.32);
        // Ring burst 2
        this._scheduleRingBurst(cycleStart + 0.42, 0.32);
      }

      // Schedule auto-stop and optional voice announcement after rings
      const totalRingtoneDuration = ringCycles * cadencePeriod;
      const timer = setTimeout(() => {
        this.isRinging = false;
        if (withVoice && tokenNumber && this.synth) {
          const isHi = window.appState?.state?.language === 'hi';
          const msg = isHi
            ? `नया ऑनलाइन टोकन प्राप्त हुआ। टोकन नंबर ${tokenNumber}।`
            : `New online patient token received. Token number ${tokenNumber}.`;
          this.speak(msg, isHi ? 'hi-IN' : 'en-IN');
        }
      }, totalRingtoneDuration * 1000);

      this.ringtoneTimeouts.push(timer);
    } catch (e) {
      console.warn("Incoming ringtone error:", e);
    }
  }

  // Dual-frequency acoustic telephone ring burst
  _scheduleRingBurst(startTime, duration) {
    if (!this.audioCtx || !this.ringtoneMasterGain) return;

    // Harmonic pair: G5 (783.99 Hz) & C6 (1046.50 Hz) - pleasant, clear, attention-grabbing
    const frequencies = [783.99, 1046.50];

    frequencies.forEach(freq => {
      const osc = this.audioCtx.createOscillator();
      const burstGain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth attack, sustain, and clean exponential decay
      burstGain.gain.setValueAtTime(0.0001, startTime);
      burstGain.gain.linearRampToValueAtTime(0.22, startTime + 0.025);
      burstGain.gain.setValueAtTime(0.22, startTime + duration - 0.05);
      burstGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(burstGain);
      burstGain.connect(this.ringtoneMasterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.06);

      this.activeOscillators.push(osc);
    });
  }

  // Stop incoming ringtone immediately (e.g. when nurse clicks Acknowledge or View Details)
  stopIncomingRingtone() {
    this.isRinging = false;

    if (this.ringtoneTimeouts && this.ringtoneTimeouts.length > 0) {
      this.ringtoneTimeouts.forEach(t => clearTimeout(t));
      this.ringtoneTimeouts = [];
    }

    if (this.ringtoneMasterGain && this.audioCtx) {
      try {
        const now = this.audioCtx.currentTime;
        this.ringtoneMasterGain.gain.cancelScheduledValues(now);
        this.ringtoneMasterGain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      } catch (e) {}
    }

    if (this.activeOscillators && this.activeOscillators.length > 0) {
      this.activeOscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {}
      });
      this.activeOscillators = [];
    }

    if (this.synth) {
      this.synth.cancel();
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
