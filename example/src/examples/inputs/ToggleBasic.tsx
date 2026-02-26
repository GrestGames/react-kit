import { useState } from 'react';
import { Toggle, Toggle01 } from '@grest-ts/react';

export default function ToggleBasic() {
  const [on, setOn] = useState(false);
  const [on01, setOn01] = useState<0 | 1>(1);

  return (
    <div className="demoRow">
      <label>
        Toggle (boolean): {on ? 'ON' : 'OFF'}
        <Toggle value={on} onChange={setOn} />
      </label>
      <label>
        Toggle01 (0|1): {on01}
        <Toggle01 value={on01} onChange={setOn01} />
      </label>
      <label>
        Toggle (custom color)
        <Toggle value={on} onChange={setOn} color="#22c55e" />
      </label>
      <label>
        Toggle (disabled)
        <Toggle value={true} disabled />
      </label>
    </div>
  );
}
