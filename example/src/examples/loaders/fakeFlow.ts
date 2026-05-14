import type { StepLoaderController } from '@grest-ts/react';

// Scripted fake flow for the loader showcase — exercises every part of the model:
// a normal start, a couple of finished steps, steps discovered mid-flow, then all
// known steps finishing while no completion event has arrived yet (the bar parks
// near 90%), and finally the real completion event ~5s later.

export function runScriptedFlow(c: StepLoaderController): () => void {
  const timers: number[] = [];
  const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

  c.start(['Connecting', 'Fetching records', 'Crunching numbers']);
  at(2200, () => c.finishStep());
  at(4400, () => c.finishStep());
  at(5200, () => c.discoverSteps(['Generating report', 'Uploading results']));
  at(7400, () => c.finishStep());
  at(9800, () => c.finishStep());
  at(12200, () => c.finishStep()); // all known steps done — bar now parks near 90%
  at(17500, () => c.complete()); // the real finish event — only this unlocks 100%

  return () => timers.forEach((t) => clearTimeout(t));
}
