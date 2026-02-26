import { ActionMenu, PillButton, Separator } from '@grest-ts/react';
import { useState } from 'react';

export default function ActionMenuBasic() {
  const [active, setActive] = useState('all');

  return (
    <>
      <div className="demoSection">
        <div className="demoLabel">ActionMenu (click the dots):</div>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <ActionMenu items={[
            { label: 'Edit', onClick: () => alert('Edit clicked') },
            { label: 'Duplicate', onClick: () => alert('Duplicate clicked') },
            { label: 'Delete', onClick: () => alert('Delete clicked'), danger: true },
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
        <PillButton dotted onClick={() => alert('Dotted!')}>Dotted</PillButton>
        <PillButton bold>Bold</PillButton>
        <PillButton selected>Selected</PillButton>
        <PillButton active activeColor="#22c55e">Custom color</PillButton>
      </div>
      <Separator label="separator" />
      <div className="demoLabel">The lines above are the Separator component.</div>
    </>
  );
}
