// Web Audio API Synthesizer for notifications, alarms, and interactions

let audioCtx: AudioContext | null = null;
let currentAlarmLoop: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a single audio beep or chime tone
 */
export function playTone(
  freq: number,
  type: OscillatorType = 'sine',
  duration: number = 0.2,
  volume: number = 0.3
) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio errors if blocked by browser policy
  }
}

/**
 * Play a pleasant click / tick sound when checking a task
 */
export function playCheckSound(volume: number = 0.3) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic upbeat arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(volume * 0.2, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.15);
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Play sound on unchecking a task
 */
export function playUncheckSound(volume: number = 0.2) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

    gain.gain.setValueAtTime(volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch {
    // Graceful fallback
  }
}

/**
 * Play a distinct, loud and clear alarm sound sequence
 * soundType can be: 'alarm' | 'bell' | 'chime' | 'digital'
 */
export function playAlarmSound(
  soundType: 'alarm' | 'bell' | 'chime' | 'digital' = 'alarm',
  volume: number = 0.7,
  repeatCount: number = 6
) {
  stopAlarmSound();
  const ctx = getAudioContext();

  let count = 0;

  const playSequence = () => {
    if (count >= repeatCount) {
      stopAlarmSound();
      return;
    }
    count++;

    const now = ctx.currentTime;

    if (soundType === 'alarm') {
      // Classic loud, energetic digital alarm pattern: BEEP-BEEP-BEEP
      [0, 0.14, 0.28, 0.42].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now + offset); // A5

        gain.gain.setValueAtTime(volume * 0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.11);
      });
    } else if (soundType === 'digital') {
      // High-pitched retro electronic alarm
      [0, 0.15, 0.3].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now + offset);
        osc.frequency.exponentialRampToValueAtTime(900, now + offset + 0.1);

        gain.gain.setValueAtTime(volume * 0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.11);
      });
    } else if (soundType === 'bell') {
      // Resonant bell chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc2.frequency.setValueAtTime(1174.66, now); // D6

      gain.gain.setValueAtTime(volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } else {
      // 'chime' - Uplifting soothing chime
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(volume * 0.3, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.6);
      });
    }
  };

  playSequence();
  currentAlarmLoop = window.setInterval(playSequence, 1400);
}

/**
 * Stop any currently ringing alarm
 */
export function stopAlarmSound() {
  if (currentAlarmLoop !== null) {
    clearInterval(currentAlarmLoop);
    currentAlarmLoop = null;
  }
}
