import { LangProvider } from './i18n/LangProvider';
import { DossierPage } from './features/dossier/DossierPage';

export default function App() {
  // Task 7 replaces this with the boot -> transition -> dossier phase machine.
  return (
    <LangProvider>
      <DossierPage onReplayBoot={() => {}} />
    </LangProvider>
  );
}
