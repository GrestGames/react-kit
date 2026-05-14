import { useState } from 'react';
import InputsPage from './pages/InputsPage';
import TextPage from './pages/TextPage';
import LayoutPage from './pages/LayoutPage';
import FormPage from './pages/FormPage';
import OtherPage from './pages/OtherPage';
import UtilsPage from './pages/UtilsPage';
import LoadersPage from './pages/LoadersPage';

const sections = [
  { key: 'inputs', label: 'Inputs', component: InputsPage },
  { key: 'text', label: 'Text Display', component: TextPage },
  { key: 'layout', label: 'Layout', component: LayoutPage },
  { key: 'form', label: 'Form & Grid', component: FormPage },
  { key: 'other', label: 'Other UI', component: OtherPage },
  { key: 'loaders', label: 'Loaders', component: LoadersPage },
  { key: 'utils', label: 'Utilities', component: UtilsPage },
] as const;

export default function App() {
  const [active, setActive] = useState<string>('inputs');
  const Page = sections.find(s => s.key === active)?.component ?? InputsPage;

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebarTitle">@grest-ts/react</div>
        {sections.map(s => (
          <div
            key={s.key}
            className={'sidebarItem' + (active === s.key ? ' sidebarItemActive' : '')}
            onClick={() => setActive(s.key)}
          >
            {s.label}
          </div>
        ))}
      </nav>
      <main className="main content">
        <Page />
      </main>
    </div>
  );
}
