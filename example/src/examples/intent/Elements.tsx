import { Fragment, ReactNode, useState } from 'react';
import { TipBox, PillButton, Tag, Button, ToolTip, Alert, toast, type Intent } from '@grest-ts/react';

export const intents: Intent[] = ['neutral', 'info', 'cool', 'success', 'warning', 'critical', 'danger'];

function AlertCell({ intent }: { intent: Intent }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button intent={intent} onClick={() => setOpen(true)}>alert</Button>
      {open && (
        <Alert intent={intent} title={`${intent} alert`} onClick={() => setOpen(false)}>
          This is a {intent} alert dialog.
        </Alert>
      )}
    </>
  );
}

type Column = { label: string; colSpan?: number; render: (i: Intent) => ReactNode };

const columns: Column[] = [
  { label: 'TipBox', render: i => <td className="center"><TipBox intent={i}>{i}</TipBox></td> },
  {
    label: 'Pill', colSpan: 3, render: i => (
      <>
        <td className="center"><PillButton intent={i}>{i}</PillButton></td>
        <td className="center"><PillButton intent={i} dotted>dotted</PillButton></td>
        <td className="center"><PillButton intent={i} selected>selected</PillButton></td>
      </>
    ),
  },
  {
    label: 'Tag', colSpan: 3, render: i => (
      <>
        <td className="center"><Tag intent={i} className="micro">{i}</Tag></td>
        <td className="center"><Tag intent={i} className="small">{i}</Tag></td>
        <td className="center"><Tag intent={i} className="normal">{i}</Tag></td>
      </>
    ),
  },
  { label: 'Tooltip', render: i => <td className="center"><ToolTip intent={i} message={`${i} tooltip`}><TipBox intent={i} onClick={() => {}}>tooltip</TipBox></ToolTip></td> },
  { label: 'Button', render: i => <td className="center"><Button intent={i} onClick={() => {}}>{i}</Button></td> },
  { label: 'Toast', render: i => <td className="center"><Button intent={i} onClick={() => { toast[i](i); }}>toast</Button></td> },
  { label: 'Alert', render: i => <td className="center"><AlertCell intent={i} /></td> },
];

export const elementColumns: { label: string; colSpan?: number }[] = columns.map(c => ({ label: c.label, colSpan: c.colSpan }));

export default function Elements({ intent }: { intent: Intent }) {
  return (
    <>
      {columns.map(col => <Fragment key={col.label}>{col.render(intent)}</Fragment>)}
    </>
  );
}
