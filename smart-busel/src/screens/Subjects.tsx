import { SubjectGrid } from '../components/SubjectGrid';

/** Все предметы. Открывается из бокового меню. */
export function Subjects({ onSubject }: { onSubject(id: string): void }) {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 p-6">
      <h1 className="text-4xl font-extrabold">Предметы</h1>
      <p className="text-mute">Выбери предмет. Внутри темы идут по порядку программы, но открыть можно любую.</p>
      <SubjectGrid onSubject={onSubject} />
    </main>
  );
}
