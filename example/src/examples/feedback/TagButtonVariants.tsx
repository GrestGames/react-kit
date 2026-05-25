import { useState } from 'react';
import { TagButton, PillButton, type Intent } from '@grest-ts/react';

const intents: Intent[] = ['default', 'neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'];
const sizes = ['micro', 'small', 'normal'] as const;

function LoadingDemo({ label, component }: { label: string; component: (loading: boolean, onClick: () => void) => React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const trigger = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: '#888', minWidth: 80 }}>{label}</span>
      {component(loading, trigger)}
    </div>
  );
}

export default function TagButtonVariants() {
  const [activeIntent, setActiveIntent] = useState<Intent | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>All intents (micro, default)</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {intents.map(intent => (
            <TagButton key={intent} intent={intent} onClick={() => {}}>{intent}</TagButton>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Sizes (success intent)</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {sizes.map(size => (
            <TagButton key={size} intent="success" size={size} onClick={() => {}}>{size}</TagButton>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Bold</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {intents.map(intent => (
            <TagButton key={intent} intent={intent} bold onClick={() => {}}>{intent}</TagButton>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Active (click to toggle)</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {intents.map(intent => (
            <TagButton
              key={intent}
              intent={intent}
              active={activeIntent === intent}
              onClick={() => setActiveIntent(prev => prev === intent ? null : intent)}
            >
              {intent}
            </TagButton>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Disabled</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {intents.map(intent => (
            <TagButton key={intent} intent={intent} disabled onClick={() => {}}>{intent}</TagButton>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Tooltip</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {intents.map(intent => (
            <TagButton key={intent} intent={intent} title={`${intent} tooltip`} onClick={() => {}}>{intent}</TagButton>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Loading — controlled (click to spin ~1.5 s, note stable width)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <LoadingDemo
            label="TagButton"
            component={(loading, onClick) => (
              <TagButton intent="info" size="small" loading={loading} onClick={onClick}>
                Click to load
              </TagButton>
            )}
          />
          <LoadingDemo
            label="PillButton"
            component={(loading, onClick) => (
              <PillButton intent="info" loading={loading} onClick={onClick}>
                Click to load
              </PillButton>
            )}
          />
        </div>
      </div>

    </div>
  );
}
