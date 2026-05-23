import { Button, RkToast } from '@grest-ts/react';

const intents = ['neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'] as const;

export default function ButtonIntents() {
  return (
    <div className="demoRow">
      {intents.map(intent => (
        <Button key={intent} intent={intent} onClick={() => { RkToast(intent); }}>{intent}</Button>
      ))}
    </div>
  );
}
