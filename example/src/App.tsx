import { useState, useEffect } from 'react';
import { TopMenu } from '@grest-ts/react';
import InputsPage from './pages/InputsPage';
import ActionsPage from './pages/ActionsPage';
import FormPage from './pages/FormPage';
import LayoutPage from './pages/LayoutPage';
import OverlaysPage from './pages/OverlaysPage';
import FeedbackPage from './pages/FeedbackPage';
import DataDisplayPage from './pages/DataDisplayPage';
import IntentPage from './pages/IntentPage';
import UtilsPage from './pages/UtilsPage';
import WizardPage from './pages/WizardPage';

const sections = [
  { key: 'inputs', label: 'Inputs', component: InputsPage },
  { key: 'actions', label: 'Buttons & Actions', component: ActionsPage },
  { key: 'form', label: 'Form & Grid', component: FormPage },
  { key: 'layout', label: 'Layout & Nav', component: LayoutPage },
  { key: 'overlays', label: 'Overlays', component: OverlaysPage },
  { key: 'feedback', label: 'Feedback', component: FeedbackPage },
  { key: 'display', label: 'Data Display', component: DataDisplayPage },
  { key: 'intent', label: 'Intent', component: IntentPage },
  { key: 'utils', label: 'Utilities', component: UtilsPage },
  { key: 'wizard', label: 'Wizard / Stepper', component: WizardPage },
] as const;

export default function App() {
  const [active, setActive] = useState<string>('inputs');
  const [dark, setDark] = useState(false);
  const Page = sections.find(s => s.key === active)?.component ?? InputsPage;

  useEffect(() => {
    document.documentElement.classList.toggle('rk-dark', dark);
  }, [dark]);

  return (
    <div className="app">
      <TopMenu
        logo="@grest-ts/react"
        items={sections.map(s => ({
          title: s.label,
          isActive: active === s.key,
          onClick: () => setActive(s.key),
        }))}
        rightItems={[{
          title: dark ? '☀' : '🌙',
          onClick: () => setDark(d => !d),
        }]}
      />
      <main className="content">
        <Page />
      </main>
    </div>
  );
}
