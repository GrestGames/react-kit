import { ToolTip, Tag, type Intent } from '@grest-ts/react';

const intents: Intent[] = ['neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'];

export default function ToolTipBasic() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <ToolTip message="This is a tooltip! It follows your cursor.">
          <Tag size="small">Hover me (cursor)</Tag>
        </ToolTip>
        <ToolTip message="<b>HTML</b> content works too!<br/>Second line here.">
          <Tag intent="info" size="small">Hover</Tag>
        </ToolTip>
        {intents.map(intent => (
          <ToolTip key={intent} message={`${intent} intent tooltip`} intent={intent}>
            <Tag intent={intent} size="small">{intent}</Tag>
          </ToolTip>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <ToolTip
          anchor="target"
          message={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontWeight: 700 }}>Anchored to the element</div>
              <div>Pins below the target with a viewport-flip, open/close delays, and richer left-aligned content — no cursor following.</div>
            </div>
          }
        >
          <Tag size="small">Hover me (anchored, below)</Tag>
        </ToolTip>
        <ToolTip
          anchor="target"
          placement="top"
          maxWidth={220}
          message={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontWeight: 700 }}>Anchored top</div>
              <div>placement="top" with maxWidth=220.</div>
            </div>
          }
        >
          <Tag intent="success" size="small">Hover me (anchored, top)</Tag>
        </ToolTip>
        <ToolTip
          anchor="target"
          placement="right"
          message={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontWeight: 700 }}>Anchored right</div>
              <div>placement="right" — flips to left when cramped.</div>
            </div>
          }
        >
          <Tag intent="cool" size="small">Hover me (anchored, right)</Tag>
        </ToolTip>
      </div>
    </div>
  );
}
