import { useState } from 'react';
import { Checkbox, Checkbox01, CheckboxGroup } from '@grest-ts/react';

const fruitOptions = [
  { id: 'apple', name: 'Apple' },
  { id: 'banana', name: 'Banana' },
  { id: 'cherry', name: 'Cherry' },
  { id: 'date', name: 'Date' },
];

export default function CheckboxBasic() {
  const [checked, setChecked] = useState(false);
  const [checked01, setChecked01] = useState<0 | 1>(1);
  const [fruits, setFruits] = useState<string[]>(['apple', 'cherry']);

  return (
    <>
      <div className="demoRow">
        <label>
          Checkbox (boolean)
          <Checkbox value={checked} onChange={setChecked} />
        </label>
        <label>
          Checkbox01 (0 | 1)
          <Checkbox01 value={checked01} onChange={setChecked01} />
        </label>
        <label>
          Checkbox (disabled)
          <Checkbox value={true} disabled />
        </label>
      </div>
      <div className="demoRow">
        <label>
          CheckboxGroup
          <CheckboxGroup value={fruits} onChange={setFruits} options={fruitOptions} />
        </label>
      </div>
      <div className="demoLabel">Selected fruits: {fruits.join(', ') || 'none'}</div>
    </>
  );
}
