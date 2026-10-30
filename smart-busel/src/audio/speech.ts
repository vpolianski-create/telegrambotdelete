/** Озвучка английских слов голосами Windows (Web Speech API). Работает офлайн, если голос установлен. */
export function englishVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis?.getVoices().find((v) => v.lang.toLowerCase().startsWith('en'));
}

export function hasEnglishVoice(): boolean {
  return !!englishVoice();
}

export function speak(text: string) {
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
