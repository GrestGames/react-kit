import { Tabs } from '@grest-ts/react';

export default function TabsBasic() {
  return (
    <Tabs
      urlKey="demo-tab"
      defaultTab="overview"
      tabs={[
        {
          urlKey: 'overview',
          title: 'Overview',
          body: () => <div>This is the <b>Overview</b> tab content.</div>,
        },
        {
          urlKey: 'details',
          title: 'Details',
          body: () => <div>Here are the <b>Details</b>. Tabs use URL params for persistence.</div>,
        },
        {
          urlKey: 'settings',
          title: 'Settings',
          body: () => <div><b>Settings</b> tab. You can control visibility with <code>isVisible</code>.</div>,
        },
      ]}
    />
  );
}
