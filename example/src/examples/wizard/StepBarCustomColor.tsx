import { useState } from 'react';
import { StepBar } from '@grest-ts/react';

const STEPS = ['Details', 'Review', 'Confirm', 'Done'] as const;

export default function StepBarCustomColor() {
  const [step, setStep] = useState(1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 500 }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--rk-text-muted)', marginBottom: 8 }}>Default (accent)</div>
        <StepBar steps={STEPS} current={step} onStepClick={setStep} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--rk-text-muted)', marginBottom: 8 }}>intent="cool"</div>
        <StepBar steps={STEPS} current={step} onStepClick={setStep} intent="cool" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--rk-text-muted)', marginBottom: 8 }}>intent="success"</div>
        <StepBar steps={STEPS} current={step} onStepClick={setStep} intent="success" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--rk-text-muted)', marginBottom: 8 }}>hue="purple"</div>
        <StepBar steps={STEPS} current={step} onStepClick={setStep} hue="purple" />
      </div>
    </div>
  );
}
