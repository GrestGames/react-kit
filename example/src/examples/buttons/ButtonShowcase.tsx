import React, { ReactNode, useState } from 'react';
import {
  TagButton,
  PillButton,
  Button,
  SubmitButton,
  SecondaryButton,
  FormCancelButton,
  Toggle,
  wrapWithPopup,
  type Intent,
  type PrimitiveButtonProps,
} from '@grest-ts/react';
import IconButtonBasic from './IconButtonBasic';

const intents: Intent[] = ['default', 'neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'];
const sizes = ['micro', 'small', 'normal'] as const;
const appearances = ['gradient', 'outline'] as const;

type ButtonType = 'Button' | 'Pill' | 'Tag';
type Size = 'micro' | 'small' | 'normal';

type BtnProps = PrimitiveButtonProps & { children: ReactNode; key?: React.Key };

const renderBtn: Record<ButtonType, (p: BtnProps) => ReactNode> = {
  Tag:    ({ key, ...p }) => <TagButton key={key} {...p} />,
  Pill:   ({ key, ...p }) => <PillButton key={key} {...p} />,
  Button: ({ key, ...p }) => <Button key={key} {...p} />,
};

// ── Table helpers ─────────────────────────────────────────────────────────────

const radioKeys = ['One', 'Two', 'Three', 'Four'] as const;

function ActiveRadioCell({ type }: { type: ButtonType }) {
  const [activeKey, setActiveKey] = useState<string>('One');
  const btn = renderBtn[type];
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {radioKeys.map(k =>
        btn({ key: k, intent: 'info', active: activeKey === k, onClick: () => setActiveKey(k), children: k })
      )}
    </div>
  );
}

function LoadingCell({ type }: { type: ButtonType }) {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const btn = renderBtn[type];
  const trigger = (set: (v: boolean) => void) => { set(true); setTimeout(() => set(false), 1500); };
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {btn({ intent: 'info', loading: loading1, onClick: () => trigger(setLoading1), children: 'Click me' })}
      {btn({ intent: 'success', loading: loading2, onClick: () => trigger(setLoading2), children: 'M' })}
    </div>
  );
}

export const rowLabels: string[] = [
  'Intents',
  'Sizes',
  'Active (manual radio)',
  'Disabled',
  'Loading (click ~1.5 s)',
  'confirmDouble',
  'Tooltip (hover)',
  'Popup (click)',
];

function getItems(type: ButtonType): ReactNode[] {
  const btn = renderBtn[type];
  return [
    // Intents
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {intents.map(intent => btn({ key: intent, intent, onClick: () => {}, children: intent }))}
    </div>,

    // Sizes
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {sizes.map(size => (
        <div key={size} style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {(['info', 'success', 'warning', 'danger'] as Intent[]).map(intent =>
            btn({ key: intent, intent, size, onClick: () => {}, children: intent })
          )}
        </div>
      ))}
    </div>,

    // Active radio
    <ActiveRadioCell type={type} />,

    // Disabled
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {(['info', 'success', 'danger'] as Intent[]).map(intent =>
        btn({ key: intent, intent, disabled: true, onClick: () => {}, children: intent })
      )}
    </div>,

    // Loading
    <LoadingCell type={type} />,

    // confirmDouble
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {btn({ intent: 'danger', confirmDouble: true, onClick: () => {}, children: 'Delete' })}
      {btn({ intent: 'warning', confirmDouble: true, onClick: () => {}, children: 'Reset' })}
    </div>,

    // Tooltip
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {(['info', 'success', 'danger'] as Intent[]).map(intent =>
        btn({ key: intent, intent, title: `${intent} tooltip`, onClick: () => {}, children: intent })
      )}
    </div>,

    // Popup (wrapWithPopup — click the trigger to open an anchored floating menu)
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {wrapWithPopup(
        { content: close => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
            <TagButton size="small" intent="info" onClick={() => { alert('Option A'); close(); }}>Option A</TagButton>
            <TagButton size="small" intent="success" onClick={() => { alert('Option B'); close(); }}>Option B</TagButton>
            <TagButton size="small" intent="danger" onClick={close}>Close</TagButton>
          </div>
        ) },
        btn({ intent: 'cool', children: 'Open menu ▾' }) as React.ReactElement
      )}
    </div>,
  ];
}

// ── Comparison table ──────────────────────────────────────────────────────────

const tableTypes: ButtonType[] = ['Button', 'Pill', 'Tag'];

const tdStyle: React.CSSProperties = {
  verticalAlign: 'top',
  padding: '8px 12px',
  borderBottom: '1px solid var(--rk-border)',
  borderRight: '1px solid var(--rk-border)',
};
const thStyle: React.CSSProperties = {
  ...tdStyle,
  fontWeight: 600,
  fontSize: 13,
  background: 'var(--rk-bg-raised)',
  color: 'var(--rk-text)',
  textAlign: 'left',
};
const rowThStyle: React.CSSProperties = {
  ...tdStyle,
  fontWeight: 500,
  fontSize: 12,
  color: 'var(--rk-text-secondary)',
  background: 'var(--rk-bg-raised)',
  whiteSpace: 'nowrap',
  minWidth: 160,
};

function StandardTable() {
  const buttonItems = getItems('Button');
  const pillItems = getItems('Pill');
  const tagItems = getItems('Tag');

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', border: '1px solid var(--rk-border)', width: '100%' }}>
        <thead>
          <tr>
            <th style={thStyle}></th>
            {tableTypes.map(t => <th key={t} style={thStyle}>{t}</th>)}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((label, i) => (
            <tr key={label}>
              <th style={rowThStyle}>{label}</th>
              <td style={tdStyle}>{buttonItems[i]}</td>
              <td style={tdStyle}>{pillItems[i]}</td>
              <td style={tdStyle}>{tagItems[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Custom table ──────────────────────────────────────────────────────────────

const stackStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };
const chipRowStyle: React.CSSProperties = { display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' };
const subLabelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--rk-text-muted)', marginBottom: 2 };

function CustomTable() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', border: '1px solid var(--rk-border)', width: '100%' }}>
        <thead>
          <tr>
            <th style={thStyle}>Custom</th>
            {tableTypes.map(t => <th key={t} style={thStyle}>{t}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            {/* row label cell — empty, mirrors Standard table layout */}
            <th style={rowThStyle}></th>

            {/* Button column */}
            <td style={tdStyle}>
              <div style={stackStyle}>
                {appearances.map(appearance => (
                  <div key={appearance}>
                    <div style={subLabelStyle}>appearance="{appearance}"</div>
                    <div style={chipRowStyle}>
                      {(['info', 'success', 'warning', 'danger', 'cool'] as Intent[]).map(intent => (
                        <Button key={intent} intent={intent} appearance={appearance} onClick={() => {}}>{intent}</Button>
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <div style={subLabelStyle}>Presets</div>
                  <div style={chipRowStyle}>
                    <SubmitButton>Save</SubmitButton>
                    <SecondaryButton onClick={() => {}}>Secondary</SecondaryButton>
                    <FormCancelButton onClick={() => {}}>Cancel</FormCancelButton>
                  </div>
                </div>
              </div>
            </td>

            {/* Pill column */}
            <td style={tdStyle}>
              <div style={stackStyle}>
                <div>
                  <div style={subLabelStyle}>dotted</div>
                  <div style={chipRowStyle}>
                    {(['info', 'success', 'warning', 'danger', 'cool'] as Intent[]).map(intent => (
                      <PillButton key={intent} intent={intent} dotted onClick={() => {}}>{intent}</PillButton>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={subLabelStyle}>dotted + bold</div>
                  <div style={chipRowStyle}>
                    {(['info', 'success', 'warning', 'danger', 'cool'] as Intent[]).map(intent => (
                      <PillButton key={intent} intent={intent} dotted bold onClick={() => {}}>{intent}</PillButton>
                    ))}
                  </div>
                </div>
              </div>
            </td>

            {/* Tag column */}
            <td style={tdStyle}>
              <div style={stackStyle}>
                <div>
                  <div style={subLabelStyle}>bold</div>
                  <div style={chipRowStyle}>
                    {intents.map(intent => (
                      <TagButton key={intent} intent={intent} bold onClick={() => {}}>{intent}</TagButton>
                    ))}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Playground ────────────────────────────────────────────────────────────────

function OptionGroup<T extends string>({
  options, value, onChange, optionIntent = () => 'neutral' as Intent,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  optionIntent?: (o: T) => Intent;
}) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {options.map(o => (
        <PillButton key={o} intent={optionIntent(o)} active={value === o} onClick={() => onChange(o)}>{o}</PillButton>
      ))}
    </div>
  );
}

function Playground() {
  const [type, setType] = useState<ButtonType>('Tag');
  const [intent, setIntent] = useState<Intent>('info');
  const [size, setSize] = useState<Size>('normal');
  const [appearance, setAppearance] = useState<'gradient' | 'outline'>('gradient');
  const [active, setActive] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDouble, setConfirmDouble] = useState(false);
  const [bold, setBold] = useState(false);
  const [dotted, setDotted] = useState(false);

  let preview: ReactNode;
  if (type === 'Tag') {
    preview = (
      <TagButton intent={intent} size={size} active={active} disabled={disabled} loading={loading}
        bold={bold} confirmDouble={confirmDouble} onClick={() => {}}>
        TagButton
      </TagButton>
    );
  } else if (type === 'Pill') {
    preview = (
      <PillButton intent={intent} size={size} active={active} disabled={disabled} loading={loading}
        bold={bold} dotted={dotted} confirmDouble={confirmDouble} onClick={() => {}}>
        PillButton
      </PillButton>
    );
  } else {
    preview = (
      <Button intent={intent} size={size} appearance={appearance} active={active} disabled={disabled}
        loading={loading} confirmDouble={confirmDouble} onClick={() => {}}>
        Button
      </Button>
    );
  }

  const stage = (
    <div style={{
      width: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
      background: 'var(--rk-bg-surface)',
      border: '1px solid var(--rk-border)',
      borderRadius: 8,
    }}>
      {preview}
    </div>
  );

  const rows: { title: string; node: ReactNode }[] = [
    {
      title: 'type',
      node: <OptionGroup options={['Tag', 'Pill', 'Button'] as const} value={type} onChange={v => setType(v as ButtonType)} />,
    },
    {
      title: 'intent',
      node: <OptionGroup options={intents} value={intent} onChange={v => setIntent(v as Intent)} optionIntent={o => o as Intent} />,
    },
    {
      title: 'size',
      node: <OptionGroup options={sizes} value={size} onChange={v => setSize(v as Size)} />,
    },
    { title: 'active',        node: <Toggle value={active}        onChange={v => setActive(v)}        /> },
    { title: 'disabled',      node: <Toggle value={disabled}      onChange={v => setDisabled(v)}      /> },
    { title: 'loading',       node: <Toggle value={loading}       onChange={v => setLoading(v)}       /> },
    { title: 'confirmDouble', node: <Toggle value={confirmDouble} onChange={v => setConfirmDouble(v)} /> },
    ...(type === 'Button' ? [{
      title: 'appearance',
      node: <OptionGroup options={appearances} value={appearance} onChange={v => setAppearance(v as 'gradient' | 'outline')} />,
    }] : []),
    ...((type === 'Tag' || type === 'Pill') ? [{
      title: 'bold',
      node: <Toggle value={bold} onChange={v => setBold(v)} />,
    }] : []),
    ...(type === 'Pill' ? [{
      title: 'dotted',
      node: <Toggle value={dotted} onChange={v => setDotted(v)} />,
    }] : []),
  ];

  const cellPad: React.CSSProperties = { padding: '6px 10px' };

  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.title}>
            {i === 0 && (
              <td rowSpan={rows.length} style={{ ...cellPad, verticalAlign: 'middle', paddingRight: 24 }}>
                {stage}
              </td>
            )}
            <td style={{ ...cellPad, textAlign: 'right', fontSize: 12, color: 'var(--rk-text-secondary)', whiteSpace: 'nowrap' }}>
              {row.title}
            </td>
            <td style={{ ...cellPad, textAlign: 'left' }}>
              {row.node}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--rk-text)', marginBottom: 12, marginTop: 32 }}>
      {children}
    </div>
  );
}

export default function ButtonShowcase() {
  return (
    <div>
      <SectionTitle>Playground</SectionTitle>
      <div style={{
        background: 'var(--rk-bg-raised)',
        border: '1px solid var(--rk-border)',
        borderRadius: 8,
        padding: 20,
      }}>
        <Playground />
      </div>

      <SectionTitle>Standard — all three types side by side</SectionTitle>
      <StandardTable />

      <SectionTitle>Custom</SectionTitle>
      <CustomTable />

      <SectionTitle>IconButton</SectionTitle>
      <IconButtonBasic />
    </div>
  );
}
