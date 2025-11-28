class AudioService {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  private init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public async playAlarm(volume: number = 0.5) {
    this.init();
    if (!this.context) return;

    // Resume context if suspended (browser policy)
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Master Gain (Volume)
    const masterGain = this.context.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(this.context.destination);
    this.gainNode = masterGain;

    // Create a rhythmic beeping pattern using an oscillator
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = 880; // A5
    
    // Modulation for the "beep beep" effect
    // We use a gain node specifically for the oscillator to pulse it
    const pulseGain = this.context.createGain();
    pulseGain.gain.setValueAtTime(0, this.context.currentTime);
    
    // Pattern: Beep (0.1s) - Pause (0.1s) - Beep (0.1s) - Long Pause (0.7s)
    const now = this.context.currentTime;
    const beepLength = 0.1;
    const interval = 1.0; // Loop every 1 second

    // We can't loop automation easily forever without a loop node or scheduling ahead.
    // Ideally, we use an LFO, but for simplicity in a Class, we'll schedule a loop 
    // or just use a simple continuous wave modulated by an LFO.
    
    // Let's use an LFO for the beeping to ensure it loops indefinitely until stopped
    const lfo = this.context.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 2; // 2Hz = 2 beeps per second roughly if we duty cycle it, but square is 50/50.
    
    // Actually, let's just do a simple continuous alternating tone which is annoying enough for an alarm
    // High - Low - High - Low
    this.oscillator.frequency.setValueAtTime(880, now);
    this.oscillator.frequency.setTargetAtTime(1100, now + 0.5, 0.1); 
    
    // LFO to modulate frequency for a "siren" effect
    const sirenLfo = this.context.createOscillator();
    sirenLfo.type = 'triangle';
    sirenLfo.frequency.value = 2; // 2 times a second
    const sirenGain = this.context.createGain();
    sirenGain.gain.value = 200; // Modulate by +/- 200Hz
    
    sirenLfo.connect(sirenGain);
    sirenGain.connect(this.oscillator.frequency);
    
    this.oscillator.connect(masterGain);
    
    sirenLfo.start();
    this.oscillator.start();
    
    // Keep refs to stop them
    this.oscillator.onended = () => {
       sirenLfo.stop();
       sirenLfo.disconnect();
    };
  }

  public stopAlarm() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {
        // ignore if already stopped
      }
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isPlaying = false;
  }
}

export const audioService = new AudioService();