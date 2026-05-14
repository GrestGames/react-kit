import { useEffect, useRef } from 'react';
import { useStepLoader, ClassicLoader, Button } from '@grest-ts/react';
import type { LoaderVariant } from '@grest-ts/react';
import { runScriptedFlow } from './fakeFlow';

// All registered loader variants render the SAME shared loader state side by side,
// so they compare apples-to-apples. Variant agents add their component here.
const variants: { name: string; Component: LoaderVariant }[] = [
  { name: 'ClassicLoader (reference)', Component: ClassicLoader },
];

export default function LoaderShowcase() {
  const { state, controller } = useStepLoader();
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelRef.current?.(), []);

  const runDemo = () => {
    cancelRef.current?.();
    cancelRef.current = runScriptedFlow(controller);
  };

  const stopDemo = () => {
    cancelRef.current?.();
    cancelRef.current = null;
  };

  return (
    <>
      <div className="demoRow">
        <Button onClick={runDemo}>Run scripted flow (~18s)</Button>
        <Button onClick={() => { stopDemo(); controller.start(3); }}>Start (3 steps)</Button>
        <Button onClick={() => controller.finishStep()}>Finish step</Button>
        <Button onClick={() => controller.discoverSteps(2)}>Discover +2</Button>
        <Button onClick={() => controller.failStep()}>Error</Button>
        <Button onClick={() => controller.complete()}>Complete</Button>
        <Button onClick={() => { stopDemo(); controller.reset(); }}>Reset</Button>
      </div>

      <div className="demoLabel" style={{ marginBottom: 16 }}>
        phase: <b>{state.phase}</b> · {Math.round(state.displayProgress * 100)}% ·{' '}
        {state.doneCount}/{state.totalKnown} done
        {state.activeStepName && <> · active: <b>{state.activeStepName}</b></>}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 24,
          alignItems: 'start',
          background: '#0a0e14',
          padding: 24,
          borderRadius: 16,
        }}
      >
        {variants.map(({ name, Component }) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Component state={state} />
            <div style={{ fontSize: 12, color: '#64748b' }}>{name}</div>
          </div>
        ))}
      </div>
    </>
  );
}
