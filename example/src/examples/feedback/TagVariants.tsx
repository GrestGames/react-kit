import {Tag, type Intent} from "@grest-ts/react";

const intents: Intent[] = ['neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'];
const sizes = ['micro', 'small', 'normal'] as const;

export default function TagVariants() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sizes.map(size => (
        <div key={size} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {intents.map(intent => <Tag key={intent} intent={intent} size={size}>{intent}</Tag>)}
        </div>
      ))}
    </div>
  );
}
