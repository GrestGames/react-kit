import { Tabs } from '@grest-ts/react';

export default function TabsSide() {
  return (
    <Tabs
      urlKey="demo-side-tab"
      defaultTab="general"
      layout="side"
      tabs={[
        { urlKey: 'general', title: 'General', group: 'General', body: () => <div>Name, logo, defaults.</div> },
        { urlKey: 'repos', title: 'Repositories', group: 'General', body: () => <div>Repositories.</div> },
        { urlKey: 'clouds', title: 'Clouds', group: 'Infrastructure', body: () => <div>Clouds.</div> },
        { urlKey: 'network', title: 'Network', group: 'Infrastructure', body: () => <div>Network.</div> },
        { urlKey: 'archive', title: 'Archive', danger: true, body: () => <div>Archive this project.</div> },
      ]}
    />
  );
}
