import { TopMenu, RkToast } from '@grest-ts/react';
import { useState } from 'react';

export default function TopMenuBasic() {
  const [active, setActive] = useState('dashboard');

  return (
    <>
      <TopMenu
        logo="MyApp"
        items={[
          { title: 'Dashboard', isActive: active === 'dashboard', onClick: () => setActive('dashboard') },
          {
            title: 'Projects',
            isActive: active.startsWith('projects'),
            subItems: [
              { title: 'Active', isActive: active === 'projects/active', onClick: () => setActive('projects/active') },
              { title: 'Archived', isActive: active === 'projects/archived', onClick: () => setActive('projects/archived') },
              { title: 'New project…', onClick: () => RkToast.success('Create new project') },
            ],
          },
          { title: 'Team', isActive: active === 'team', onClick: () => setActive('team') },
        ]}
        rightItems={[
          {
            title: '⚙',
            subItems: [
              { title: 'Profile', onClick: () => RkToast.info('Profile') },
              { title: 'Settings', onClick: () => RkToast.info('Settings') },
              { title: 'Log out', onClick: () => RkToast('Logged out') },
            ],
          },
        ]}
      />
      <div className="demoLabel" style={{ marginTop: 12 }}>
        Active section: <code>{active}</code> — hover <b>Projects</b> or the <b>⚙</b> for dropdowns.
        Items take <code>isActive</code>, <code>onClick</code>, <code>isVisible</code> and nested <code>subItems</code>;
        the bar collapses to a hamburger menu below 768px.
      </div>
    </>
  );
}
