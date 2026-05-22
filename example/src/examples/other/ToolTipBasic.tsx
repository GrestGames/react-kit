import { ToolTip, Tag, type Intent } from '@grest-ts/react';

const intents: Intent[] = ['neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'];

export default function ToolTipBasic() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <ToolTip message="This is a tooltip! It follows your cursor.">
        <Tag size="small">Hover me</Tag>
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
  );
}
