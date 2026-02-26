import { useState } from 'react';
import { DateInput, YearMonthSelect } from '@grest-ts/react';

export default function DateInputBasic() {
  const [date, setDate] = useState<string | null>('2025-06-15');
  const [ym, setYm] = useState<string | null>('2025-06');

  return (
    <div className="demoRow">
      <label>
        DateInput
        <DateInput value={date} onChange={setDate} />
      </label>
      <label>
        YearMonthSelect
        <YearMonthSelect value={ym} onChange={setYm} />
      </label>
      <label>
        DateInput (readOnly)
        <DateInput value={date} readOnly />
      </label>
    </div>
  );
}
