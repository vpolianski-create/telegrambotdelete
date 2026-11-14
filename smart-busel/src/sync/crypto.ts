/**
 * Сквозное шифрование прогресса.
 *
 * Семейный код (20 знаков, ~100 бит случайности) придумывает само приложение. Из него выводятся:
 * - номер «семьи» в облаке (по нему устройства находят друг друга; по номеру код восстановить нельзя);
 * - ключ шифрования AES-256-GCM (не покидает устройство).
 * В облако уходит только шифр. Подменённые или повреждённые данные расшифровка отвергает.
 * Используется только встроенная криптография (Web Crypto) — без сторонних библиотек.
 */

/** Алфавит Крокфорда: без похожих знаков I, L, O, U. */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const CODE_LENGTH = 20;
const SALT = 'smart-busel-sync-v1';
const enc = new TextEncoder();
const dec = new TextDecoder();

function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}

/** Новый семейный код вида XXXX-XXXX-XXXX-XXXX-XXXX. */
export function generateFamilyCode(): string {
  const out: string[] = [];
  // 32 = 2^5: остаток от деления байта на 32 даёт равномерный выбор знака
  for (const b of randomBytes(CODE_LENGTH)) out.push(ALPHABET[b % 32]);
  return formatCode(out.join(''));
}

export const formatCode = (raw: string) => raw.match(/.{1,4}/g)?.join('-') ?? raw;

/** Приводит введённый код к виду из 20 знаков (пробелы, дефисы, строчные буквы, O/0, I/1 — не важны). null — код неверный. */
export function normalizeCode(input: string): string | null {
  const s = input.toUpperCase().replace(/[\s\-_.]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  if (s.length !== CODE_LENGTH) return null;
  for (const ch of s) if (!ALPHABET.includes(ch)) return null;
  return s;
}

export const randomId = (): string => [...randomBytes(16)].map((b) => b.toString(16).padStart(2, '0')).join('');

export interface FamilyKeys { familyId: string; key: CryptoKey }

/** Из кода → номер семьи и ключ шифрования (HKDF-SHA-256). */
export async function deriveFamily(code: string): Promise<FamilyKeys> {
  const norm = normalizeCode(code);
  if (!norm) throw new Error('bad-code');
  const ikm = await crypto.subtle.importKey('raw', enc.encode(norm), 'HKDF', false, ['deriveBits', 'deriveKey']);
  const params = (info: string) => ({ name: 'HKDF', hash: 'SHA-256', salt: enc.encode(SALT), info: enc.encode(info) });
  const idBits = new Uint8Array(await crypto.subtle.deriveBits(params('family-id'), ikm, 128));
  const key = await crypto.subtle.deriveKey(params('aes-gcm-key'), ikm, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  return { familyId: [...idBits].map((b) => b.toString(16).padStart(2, '0')).join(''), key };
}

// ——— base64 без переполнения стека на больших данных ———
export function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
export function fromBase64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function pipe(data: Uint8Array, stream: { readable: ReadableStream; writable: WritableStream }): Promise<Uint8Array> {
  const out = new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}
const canGzip = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

/** Первый байт открытого текста: 1 — сжато gzip, 0 — без сжатия. */
async function pack(json: string): Promise<Uint8Array> {
  const raw = enc.encode(json);
  const body = canGzip() ? await pipe(raw, new CompressionStream('gzip')) : raw;
  const out = new Uint8Array(body.length + 1);
  out[0] = canGzip() ? 1 : 0;
  out.set(body, 1);
  return out;
}
async function unpack(bytes: Uint8Array): Promise<string> {
  const body = bytes.subarray(1);
  if (bytes[0] === 1) return dec.decode(await pipe(body, new DecompressionStream('gzip')));
  return dec.decode(body);
}

/** Дополнительные данные шифра: шифр «привязан» к своей семье и своему устройству, переставить его нельзя. */
const aad = (familyId: string, deviceId: string) => enc.encode(`busel:v1:${familyId}:${deviceId}`);

export interface Sealed { iv: string; ct: string }

export async function seal(keys: FamilyKeys, deviceId: string, value: unknown): Promise<Sealed> {
  const iv = randomBytes(12);
  const plain = await pack(JSON.stringify(value));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource, additionalData: aad(keys.familyId, deviceId) as BufferSource }, keys.key, plain as BufferSource));
  return { iv: toBase64(iv), ct: toBase64(ct) };
}

/** Расшифровка. Неверный ключ, подмена или повреждение — исключение. */
export async function open<T>(keys: FamilyKeys, deviceId: string, sealed: Sealed): Promise<T> {
  const plain = new Uint8Array(await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(sealed.iv) as BufferSource, additionalData: aad(keys.familyId, deviceId) as BufferSource },
    keys.key, fromBase64(sealed.ct) as BufferSource,
  ));
  return JSON.parse(await unpack(plain)) as T;
}
