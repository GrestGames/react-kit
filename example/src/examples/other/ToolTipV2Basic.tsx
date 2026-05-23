import { ToolTipV2, Button, Tag, type Intent } from '@grest-ts/react';

const intents: Intent[] = ['neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'];

export default function ToolTipV2Basic() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <ToolTipV2 message="This is a V2 tooltip! It follows your cursor.">
          <Tag size="small">Hover me (cursor)</Tag>
        </ToolTipV2>
        <ToolTipV2 message="<b>HTML</b> content works too!<br/>Second line here.">
          <Tag intent="info" size="small">Hover</Tag>
        </ToolTipV2>
        {intents.map(intent => (
          <ToolTipV2 key={intent} message={`${intent} intent tooltip`} intent={intent}>
            <Tag intent={intent} size="small">{intent}</Tag>
          </ToolTipV2>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <ToolTipV2
          anchor="target"
          message={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontWeight: 700 }}>Anchored to the element</div>
              <div>Pins below the target with a viewport-flip and open/close delays — no cursor following.</div>
            </div>
          }
        >
          <Tag size="small">Hover me (anchored, below)</Tag>
        </ToolTipV2>
        <ToolTipV2
          anchor="target"
          placement="above"
          maxWidth={220}
          message={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontWeight: 700 }}>Anchored above</div>
              <div>placement="above" with maxWidth=220.</div>
            </div>
          }
        >
          <Tag intent="success" size="small">Hover me (anchored, above)</Tag>
        </ToolTipV2>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button onClick={() => {}} tooltip="Saves your changes to the server.">
          Button with tooltip
        </Button>
        <Button
          intent="danger"
          onClick={() => {}}
          tooltip={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontWeight: 700 }}>Permanent delete</div>
              <div>This cannot be undone. Styled, rich content.</div>
            </div>
          }
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
