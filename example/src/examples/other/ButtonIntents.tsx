import { Button, toast } from '@grest-ts/react';

const intents = ['neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'] as const;

export default function ButtonIntents() {
  return (
    <div className="demoRow">
      {intents.map(intent => (
        <Button key={intent} intent={intent} onClick={() => { toast(intent); }}>{intent}</Button>
      ))}
    </div>
  );
}
