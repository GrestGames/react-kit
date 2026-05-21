import { ActionMenu, PillButton, Separator, toast } from '@grest-ts/react';
import { useState } from 'react';

export default function ActionMenuBasic() {
  const [active, setActive] = useState('all');

  return (
    <>
      <div className="demoSection">
        <div className="demoLabel">ActionMenu (click the dots):</div>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <ActionMenu items={[
            { label: 'Actions', info: true },
            { label: 'Edit', onClick: () => toast.info('Edit clicked') },
            { label: 'Duplicate', onClick: () => toast.success('Duplicated') },
            { label: 'Sync (async)', keepOpen: true, onClick: async () => { await new Promise(r => setTimeout(r, 1200)); toast.success('Synced'); } },
            { separator: true },
            { label: 'Archive', warning: true, onClick: () => toast.warning('Archived') },
            { label: 'Delete', danger: true, onClick: () => toast.error('Deleted') },
          ]} />
        </div>
      </div>
      <Separator label="PillButton" />
      <div className="demoRow">
        {['all', 'active', 'archived'].map(key => (
          <PillButton key={key} active={active === key} onClick={() => setActive(key)}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </PillButton>
        ))}
        <PillButton dotted onClick={() => toast('Dotted pill clicked')}>Dotted</PillButton>
        <PillButton bold>Bold</PillButton>
        <PillButton selected>Selected</PillButton>
        <PillButton active activeColor="#22c55e">Custom color</PillButton>
      </div>
      <Separator label="separator" />
      <div className="demoLabel">The lines above are the Separator component.</div>
    </>
  );
}
