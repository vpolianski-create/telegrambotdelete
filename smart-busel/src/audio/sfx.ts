import { useApp } from '../store/useApp';

/** Короткие приятные звуки, синтезируются на лету (без файлов, работают офлайн). Выключаются в настройках. */
type Note = [freq: number, start: number, dur: number];

const SOUNDS: Record<string, Note[]> = {
  correct: [[659, 0, 0.12], [880, 0.1, 0.2]],
  combo: [[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.1], [1047, 0.27, 0.3]],
  soft: [[392, 0, 0.18]], // мягкий нейтральный звук, без «ошибочного» сигнала
  badge: [[784, 0, 0.12], [988, 0.12, 0.12], [1319, 0.24, 0.3]],
  level: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.12], [1319, 0.48, 0.45]],
  reward: [[523, 0, 0.15], [523, 0.18, 0.15], [523, 0.36, 0.15], [659, 0.54, 0.2], [784, 0.76, 0.2], [1047, 0.98, 0.6]],
};

let ctx: AudioContext | undefined;

export type SfxName = keyof typeof SOUNDS;

export function play(name: SfxName) {
  if (!useApp.getState().settings.sound) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const t0 = ctx.currentTime;
    for (const [freq, start, dur] of SOUNDS[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0 + start);
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + start);
      osc.stop(t0 + start + dur + 0.05);
    }
  } catch { /* звук необязателен */ }
}
