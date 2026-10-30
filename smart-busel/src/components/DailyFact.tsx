import { allTopics } from '../content/loader';

const hash = (s: string) => [...s].reduce((h, c) => (h * 33 + c.charCodeAt(0)) >>> 0, 5381);

/** «Знаешь ли ты?» — интересный факт дня из карточек знаний. Кнопка ведёт к теме. */
export function DailyFact({ date, onOpen }: { date: string; onOpen(subjectId: string, topicId: string): void }) {
  const withCards = allTopics.filter((x) => x.topic.card && x.topic.status === 'ready');
  if (!withCards.length) return null;
  const { subject, topic } = withCards[hash(date) % withCards.length];
  return (
    <section className="flex flex-col gap-2 rounded-xl3 bg-card p-5 shadow">
      <h2 className="text-xl font-extrabold">Знаешь ли ты?</h2>
      <p className="text-5xl" aria-hidden>{topic.card!.emoji}</p>
      <p className="text-lg"><b>{topic.card!.title}.</b> {topic.card!.fact}</p>
      <button onClick={() => onOpen(subject.id, topic.id)} className="self-start rounded-xl2 bg-soft px-5 font-bold">Узнать больше: {subject.title} →</button>
    </section>
  );
}
