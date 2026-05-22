import { PillButton, toast, type Intent } from '@grest-ts/react';
import { useState } from 'react';

const intents: Intent[] = ['neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'];

export default function PillButtonBasic() {
  const [active, setActive] = useState('all');
  const [chosen, setChosen] = useState<Intent[]>([]);
  const toggle = (i: Intent) => setChosen(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

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
        <PillButton disabled onClick={() => toast('should not fire')}>Disabled</PillButton>
        <PillButton intent="success" active disabled>Disabled active</PillButton>
      </div>
      <div>
        {intents.map(intent => (
          <PillButton key={intent} intent={intent} active={chosen.includes(intent)} onClick={() => toggle(intent)}>{intent}</PillButton>
        ))}
      </div>
    </>
  );
}
