import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeToast } from './components/BadgeToast';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { RewardOverlay } from './components/RewardOverlay';
import { SessionGuard } from './components/SessionGuard';
import { Collection } from './screens/Collection';
import { Home } from './screens/Home';
import { Lesson } from './screens/Lesson';
import { Parent } from './screens/Parent';
import { SubjectScreen } from './screens/Subject';
import { Vocabulary } from './screens/Vocabulary';
import { useApp } from './store/useApp';

type Route =
  | { name: 'home' }
  | { name: 'subject'; id: string }
  | { name: 'lesson'; subject: string; topic: string; attempt: number }
  | { name: 'vocab' }
  | { name: 'collection' }
  | { name: 'parent' };

export default function App() {
  const { init, ready, settings } = useApp();
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => { void init(); }, [init]);
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.style.setProperty('--font-scale', String(settings.fontScale));
  }, [settings.theme, settings.fontScale]);

  if (!ready) return null;
  const home = () => setRoute({ name: 'home' });
  const lesson = (subject: string, topic: string) => setRoute({ name: 'lesson', subject, topic, attempt: 0 });
  const pageKey = route.name === 'lesson' ? `lesson-${route.topic}-${route.attempt}` : route.name;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={pageKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {route.name === 'home' && <Home onSubject={(id) => setRoute({ name: 'subject', id })} onParent={() => setRoute({ name: 'parent' })} onTopic={lesson} onCollection={() => setRoute({ name: 'collection' })} />}
          {route.name === 'subject' && (
            <SubjectScreen id={route.id} onBack={home} onTopic={(t) => lesson(route.id, t)} onVocab={() => setRoute({ name: 'vocab' })} />
          )}
          {route.name === 'lesson' && (
            <Lesson subjectId={route.subject} topicId={route.topic} onExit={() => setRoute({ name: 'subject', id: route.subject })}
              onRetry={() => setRoute({ ...route, attempt: route.attempt + 1 })} />
          )}
          {route.name === 'vocab' && <Vocabulary onBack={() => setRoute({ name: 'subject', id: 'english' })} />}
          {route.name === 'collection' && <Collection onBack={home} />}
          {route.name === 'parent' && <Parent onBack={home} />}
        </motion.div>
      </AnimatePresence>
      <LevelUpOverlay />
      <RewardOverlay />
      <BadgeToast />
      <SessionGuard />
    </>
  );
}
