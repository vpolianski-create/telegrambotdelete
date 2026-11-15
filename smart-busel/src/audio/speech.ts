/**
 * Озвучка английских слов. Windows — голоса Windows (Web Speech API), Android — системный синтез речи
 * (обычно «Синтез речи Google»). Работает без интернета, если английский голос установлен.
 */
import { isAndroid } from '../platform';

/** Android: найден ли английский голос (null — ещё не проверяли). */
let androidVoice: boolean | null = null;
const tts = () => import('@capacitor-community/text-to-speech').then((m) => m.TextToSpeech);

export function englishVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis?.getVoices().find((v) => v.lang.toLowerCase().startsWith('en'));
}

export function hasEnglishVoice(): boolean {
  if (isAndroid()) return androidVoice !== false;
  return !!englishVoice();
}

/** Android: проверить голос заранее (ответ приходит не сразу). */
export async function checkVoice(): Promise<boolean> {
  if (!isAndroid()) return hasEnglishVoice();
  try { androidVoice = (await (await tts()).isLanguageSupported({ lang: 'en-US' })).supported; }
  catch { androidVoice = false; }
  return androidVoice;
}

/** Подсказка родителю, где включить английский голос. */
export const voiceHint = () => (isAndroid()
  ? 'Английский голос не найден: Настройки Android → Система → Язык → Синтез речи → установите английский язык (English (United States)).'
  : 'Английский голос не найден: Параметры Windows → Время и язык → Язык и регион → добавить English (United States).');

export function speak(text: string) {
  if (isAndroid()) {
    void tts().then(async (t) => { await t.stop().catch(() => undefined); await t.speak({ text, lang: 'en-US', rate: 0.85, category: 'ambient' }); }).catch(() => undefined);
    return;
  }
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  const v = englishVoice();
  if (v) u.voice = v;
  u.rate = 0.85;
  synth.speak(u);
}
