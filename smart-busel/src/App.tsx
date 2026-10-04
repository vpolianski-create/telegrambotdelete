import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RewardOverlay } from './components/RewardOverlay';
import { Home } from './screens/Home';
import { Parent } from './screens/Parent';
import { SubjectScreen } from './screens/Subject';
import { useApp } from './store/useApp';

type Route = { name: 'home' } | { name: 'subject'; id: string } | { name: 'parent' };

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
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={route.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {route.name === 'home' && <Home onSubject={(id) => setRoute({ name: 'subject', id })} onParent={() => setRoute({ name: 'parent' })} />}
          {route.name === 'subject' && <SubjectScreen id={route.id} onBack={home} />}
          {route.name === 'parent' && <Parent onBack={home} />}
        </motion.div>
      </AnimatePresence>
      <RewardOverlay />
    </>
  );
}
