import { useState } from 'react';
import { TextInput, IntegerInput, Select } from '@grest-ts/react';

const statusOptions = [
  { id: 'active', name: 'Active' },
  { id: 'paused', name: 'Paused' },
  { id: 'closed', name: 'Closed' },
];

export default function InlineEditBasic() {
  const [name, setName] = useState<string | null>('John Doe');
  const [age, setAge] = useState<number | null>(30);
  const [status, setStatus] = useState<string>('active');

  return (
    <>
      <div className="demoLabel">Click on the values below to edit them inline:</div>
      <table>
        <tbody>
          <tr>
            <td style={{ padding: '4px 12px 4px 0', color: '#64748b' }}>Name:</td>
            <td><TextInput value={name} onChange={setName} inlineEdit inlineEditPlaceholder="Click to set name" /></td>
          </tr>
          <tr>
            <td style={{ padding: '4px 12px 4px 0', color: '#64748b' }}>Age:</td>
            <td><IntegerInput value={age} onChange={setAge} inlineEdit inlineEditPlaceholder="Click to set age" suffix="years" /></td>
          </tr>
          <tr>
            <td style={{ padding: '4px 12px 4px 0', color: '#64748b' }}>Status:</td>
            <td><Select value={status} onChange={(v) => setStatus(v as string)} options={statusOptions} inlineEdit /></td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
