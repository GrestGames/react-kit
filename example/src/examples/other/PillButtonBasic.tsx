import { PillButton, toast } from '@grest-ts/react';
import { useState } from 'react';

export default function PillButtonBasic() {
  const [active, setActive] = useState('all');

  return (
    <>
      <div>
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
      <div>
        {(['neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'] as const).map(intent => (
          <PillButton key={intent} intent={intent}>{intent}</PillButton>
        ))}
      </div>
    </>
  );
}
