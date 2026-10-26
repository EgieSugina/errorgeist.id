import { useCallback, useState } from 'react';
import { LangProvider } from './i18n/LangProvider';
import { DossierPage } from './features/dossier/DossierPage';
import { BootTerminal } from './features/boot/BootTerminal';
import { CrtTransition } from './features/fx/CrtTransition';
import { readStore, writeStore } from './lib/storage';
import { prefersReducedMotion } from './lib/reducedMotion';

type Phase = 'boot' | 'transition' | 'dossier';

const BOOT_SEEN_KEY = 'egs.bootSeen';

function initialPhase(): Phase {
  if (prefersReducedMotion()) return 'dossier';
  return readStore('session', BOOT_SEEN_KEY) === '1' ? 'dossier' : 'boot';
}

export default function App() {
  const [phase, setPhase] = useState<Phase>(initialPhase);

  // Functional updates make each hop fire at most once, however many times
  // a child reports it (rapid keys, a skip racing the natural end).
  const finishBoot = useCallback(() => {
    setPhase((p) => (p === 'boot' ? 'transition' : p));
  }, []);

  const finishTransition = useCallback(() => {
    writeStore('session', BOOT_SEEN_KEY, '1');
    setPhase((p) => (p === 'transition' ? 'dossier' : p));
  }, []);

  const replayBoot = useCallback(() => {
    writeStore('session', BOOT_SEEN_KEY, null);
    setPhase('boot');
  }, []);

  return (
    <LangProvider>
      {phase === 'boot' && <BootTerminal onFinish={finishBoot} />}
      {phase === 'transition' && <CrtTransition onDone={finishTransition} />}
      {phase === 'dossier' && <DossierPage onReplayBoot={replayBoot} />}
    </LangProvider>
  );
}
