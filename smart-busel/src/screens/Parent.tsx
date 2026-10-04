import { useState } from 'react';
import { useApp } from '../store/useApp';

export function Parent({ onBack }: { onBack(): void }) {
  const { settings, rewards, points, updateSettings, giveReward, addPoints } = useApp();
  const [pin, setPin] = useState('');
  const [ok, setOk] = useState(false);
  const [newPin, setNewPin] = useState('');

  if (!ok) {
    return (
      <main className="mx-auto flex max-w-sm flex-col gap-4 p-8">
        <button onClick={onBack} className="self-start rounded-xl2 bg-card px-5 shadow">← Назад</button>
        <h1 className="text-2xl font-extrabold">Родительский режим</h1>
        <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)}
          aria-label="PIN" className="rounded-xl2 border p-3 text-center text-2xl tracking-widest" />
        <button onClick={() => setOk(pin === settings.pin)} className="rounded-xl2 bg-brand text-white">Войти</button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <button onClick={onBack} className="self-start rounded-xl2 bg-card px-5 shadow">← Назад</button>
      <h1 className="text-2xl font-extrabold">Родительский режим</h1>

      {!settings.pinChanged && (
        <div className="rounded-xl2 bg-accent/20 p-4">
          <p className="mb-2 font-bold">Смените PIN по умолчанию (0000)</p>
          <input value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            aria-label="Новый PIN" className="mr-2 rounded-xl2 border p-2" />
          <button disabled={newPin.length < 4} className="rounded-xl2 bg-brand px-4 text-white disabled:opacity-40"
            onClick={() => updateSettings({ pin: newPin, pinChanged: true })}>Сохранить</button>
        </div>
      )}

      <section className="rounded-xl2 bg-card p-4 shadow">
        <h2 className="mb-2 text-xl font-extrabold">Награды (всего баллов: {points})</h2>
        <label className="mb-3 block">Порог, баллов:{' '}
          <input type="number" min={10} step={10} value={settings.rewardThreshold}
            onChange={(e) => updateSettings({ rewardThreshold: Math.max(10, Number(e.target.value) || 100) })}
            className="w-24 rounded-xl2 border p-2" />
        </label>
        {rewards.length === 0 && <p className="text-mute">Наград пока нет.</p>}
        <ul className="flex flex-col gap-2">
          {rewards.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-xl2 bg-black/5 px-4 py-2">
              <span>{r.points} баллов — {r.text} · {r.status === 'given' ? 'Выдана ✓' : 'Ожидает'}</span>
              {r.status === 'pending' && (
                <button onClick={() => giveReward(r.id)} className="rounded-xl2 bg-ok px-4 text-white">Выдана</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl2 bg-card p-4 shadow">
        <h2 className="mb-2 text-xl font-extrabold">Проверка (на время разработки)</h2>
        <button onClick={() => addPoints(10)} className="rounded-xl2 bg-brand px-4 text-white">+10 баллов</button>
      </section>
    </main>
  );
}
