import { subjectArt } from '../content/subjectArt';

/** Картинка предмета; если её нет — эмодзи из контента. Размер в px при обычном шрифте. */
export function SubjectArt({ subject, size = 64 }: { subject: { id: string; icon: string }; size?: number }) {
  const url = subjectArt(subject.id);
  const box = `${size / 16}rem`;
  if (!url) return <span aria-hidden className="inline-flex shrink-0 items-center justify-center" style={{ width: box, height: box, fontSize: `${(size * 0.72) / 16}rem`, lineHeight: 1 }}>{subject.icon}</span>;
  return <img src={url} alt="" draggable={false} className="shrink-0 object-contain" style={{ width: box, height: box }} />;
}
