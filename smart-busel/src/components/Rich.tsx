/** Выделяет **ключевые слова** в тексте. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') ? <strong key={i} className="font-extrabold text-brandink">{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>,
      )}
    </>
  );
}
