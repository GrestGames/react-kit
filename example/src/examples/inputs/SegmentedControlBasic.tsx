import { useState } from 'react';
import { Button, SegmentedControl } from '@grest-ts/react';

type Who = 'all' | 'agents' | 'system' | 'outside';
type Lane = 'both' | 'work' | 'setup';

export default function SegmentedControlBasic() {
  const [who, setWho] = useState<Who>('all');
  const [lane, setLane] = useState<Lane>('both');
  const [view, setView] = useState<string>('list');

  return (
    <>
      <div className="demoRow">
        <SegmentedControl<Who>
          aria-label="Who"
          size="small"
          value={who}
          onChange={setWho}
          options={[
            { id: 'all', name: 'All' },
            { id: 'agents', name: 'Agents' },
            { id: 'system', name: 'System', title: 'Platform traffic' },
            { id: 'outside', name: 'Outside' },
          ]}
        />
        <SegmentedControl<Lane>
          aria-label="Lane"
          size="small"
          value={lane}
          onChange={setLane}
          options={[
            { id: 'both', name: 'Both' },
            { id: 'work', name: 'Work' },
            { id: 'setup', name: 'Setup only' },
          ]}
        />
        <Button size="small">Button size="small"</Button>
      </div>
      <div className="demoRow">
        {(['micro', 'small', 'normal'] as const).map((size) => (
          <SegmentedControl key={size} size={size} value={view} onChange={setView}
            options={[{ id: 'list', name: 'List' }, { id: 'grid', name: 'Grid' }, { id: 'map', name: 'Map' }]} />
        ))}
      </div>
      <div className="demoRow">
        <SegmentedControl intent="success" value={view} onChange={setView}
          options={[{ id: 'list', name: 'List' }, { id: 'grid', name: 'Grid' }, { id: 'map', name: 'Map', disabled: true, title: 'Needs coordinates' }]} />
        <SegmentedControl intent="warning" value={view} onChange={setView}
          options={[{ id: 'list', name: 'List' }, { id: 'grid', name: 'Grid' }, { id: 'map', name: 'Map' }]} />
        <SegmentedControl disabled value={view}
          options={[{ id: 'list', name: 'List' }, { id: 'grid', name: 'Grid' }, { id: 'map', name: 'Map' }]} />
      </div>
    </>
  );
}
