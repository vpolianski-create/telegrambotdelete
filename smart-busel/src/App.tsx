import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeToast } from './components/BadgeToast';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { RewardOverlay } from './components/RewardOverlay';
import { SessionGuard } from './components/SessionGuard';
import { Sidebar, type NavId } from './components/Sidebar';
import { reviewList } from './content/review';
import { Certificates } from './screens/Certificates';
import { Collection } from './screens/Collection';
import { Home } from './screens/Home';
import { Lesson } from './screens/Lesson';
import { Parent } from './screens/Parent';
import { Plan } from './screens/Plan';
import { Review } from './screens/Review';
import { SubjectScreen } from './screens/Subject';
import { Subjects } from './screens/Subjects';
import { Vocabulary } from './screens/Vocabulary';
import { Warmup } from './screens/Warmup';
import { resolveTheme } from './engine/theme';
import { useApp } from './store/useApp';

type Route =
  | { name: 'home' }
  | { name: 'subjects' }
  | { name: 'subject'; id: string }
  | { name: 'lesson'; subject: string; topic: string; attempt: number }
  | { name: 'vocab' }
  | { name: 'collection' }
  | { name: 'certs' }
  | { name: 'plan' }
  | { name: 'review' }
  | { name: 'warmup' }
  | { name: 'parent' };

export default function App() {
  const { init, ready, settings, mistakes } = useApp();
  const reviewCount = useMemo(() => reviewList(mistakes, 99).length, [mistakes]);
  const scroller = useRef<HTMLDivElement>(null);
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => { void init(); }, [init]);
  useEffect(() => {
    // «Как в Windows»: берём тему системы и следим за её сменой
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { document.documentElement.dataset.theme = resolveTheme(settings.theme, mq.matches); };
    apply();
    window.busel?.setTheme?.(settings.theme); // заголовок окна Windows — того же цвета
    if (settings.theme !== 'system') return;
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings.theme]);
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(settings.fontScale));
  }, [settings.fontScale]);

  const pageKey = route.name === 'lesson' ? `lesson-${route.topic}-${route.attempt}` : route.name === 'subject' ? `subject-${route.id}` : route.name;
  // новый экран всегда открывается сверху
  useEffect(() => { scroller.current?.scrollTo(0, 0); }, [pageKey]);

  if (!ready) return null;
  const home = () => setRoute({ name: 'home' });
  const subjectsList = () => setRoute({ name: 'subjects' });
  const lesson = (subject: string, topic: string) => setRoute({ name: 'lesson', subject, topic, attempt: 0 });
  /** Какой пункт меню подсветить для текущего экрана. */
  const NAV: Record<Route['name'], NavId> = {
    home: 'home', warmup: 'home', subjects: 'subjects', subject: 'subjects', lesson: 'subjects', vocab: 'subjects',
    plan: 'plan', review: 'review', collection: 'collection', certs: 'collection', parent: 'parent',
  };

  return (
    <>
      <div className="flex h-full">
        <Sidebar active={NAV[route.name]} reviewCount={reviewCount} onNavigate={(id) => setRoute({ name: id } as Route)} />
        <div ref={scroller} className="h-full min-w-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={pageKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
              {route.name === 'home' && <Home reviewCount={reviewCount} onSubject={(id) => setRoute({ name: 'subject', id })} onSubjects={subjectsList} onTopic={lesson} onPlan={() => setRoute({ name: 'plan' })} onReview={() => setRoute({ name: 'review' })} onWarmup={() => setRoute({ name: 'warmup' })} />}
              {route.name === 'subjects' && <Subjects onSubject={(id) => setRoute({ name: 'subject', id })} />}
              {route.name === 'subject' && (
                <SubjectScreen id={route.id} onBack={subjectsList} onTopic={(t) => lesson(route.id, t)} onVocab={() => setRoute({ name: 'vocab' })} />
              )}
              {route.name === 'lesson' && (
                <Lesson subjectId={route.subject} topicId={route.topic} onExit={() => setRoute({ name: 'subject', id: route.subject })}
                  onRetry={() => setRoute({ ...route, attempt: route.attempt + 1 })} />
              )}
              {route.name === 'vocab' && <Vocabulary onBack={() => setRoute({ name: 'subject', id: 'english' })} />}
              {route.name === 'collection' && <Collection onCerts={() => setRoute({ name: 'certs' })} />}
              {route.name === 'certs' && <Certificates onBack={() => setRoute({ name: 'collection' })} />}
              {route.name === 'plan' && <Plan onTopic={lesson} />}
              {route.name === 'review' && <Review onBack={home} />}
              {route.name === 'warmup' && <Warmup onBack={home} />}
              {route.name === 'parent' && <Parent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <LevelUpOverlay />
      <RewardOverlay />
      <BadgeToast />
      <SessionGuard />
    </>
  );
}
