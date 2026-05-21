import { useState, useEffect } from 'react';
import { TopMenu } from '@grest-ts/react';
import InputsPage from './pages/InputsPage';
import TextPage from './pages/TextPage';
import LayoutPage from './pages/LayoutPage';
import FormPage from './pages/FormPage';
import OtherPage from './pages/OtherPage';
import UtilsPage from './pages/UtilsPage';

const sections = [
  { key: 'inputs', label: 'Inputs', component: InputsPage },
  { key: 'text', label: 'Text Display', component: TextPage },
  { key: 'layout', label: 'Layout', component: LayoutPage },
  { key: 'form', label: 'Form & Grid', component: FormPage },
  { key: 'other', label: 'Other UI', component: OtherPage },
  { key: 'utils', label: 'Utilities', component: UtilsPage },
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
