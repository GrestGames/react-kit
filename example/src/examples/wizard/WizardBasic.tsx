import { useState } from 'react';
import { StepBar, SlideDeck, AutoHeight, Button } from '@grest-ts/react';

const STEPS = ['Account', 'Project', 'Finish'] as const;

export default function WizardBasic() {
  const [step, setStep] = useState(0);

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ marginBottom: 32 }}>
        <StepBar steps={STEPS} current={step} onStepClick={setStep} />
      </div>

      <AutoHeight>
        <SlideDeck
          index={step}
          slides={[
            <StepContent
              title="Create your account"
              body="Give your organization a name so your team knows where they are."
              onBack={undefined}
              onNext={() => setStep(1)}
              nextLabel="Continue →"
            />,
            <StepContent
              title="Set up your first project"
              body="A project groups your repositories and workspaces. You can add repos later."
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
              nextLabel="Continue →"
            />,
            <StepContent
              title="You're all set!"
              body="Your workspace is ready. Launch it to start working with AI agents."
              onBack={() => setStep(1)}
              onNext={() => setStep(0)}
              nextLabel="Start over"
            />,
          ]}
        />
      </AutoHeight>
    </div>
  );
}

function StepContent({ title, body, onBack, onNext, nextLabel }: {
  title: string;
  body: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 14, color: 'var(--rk-text-muted)', lineHeight: 1.6 }}>{body}</div>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--rk-border)', margin: '16px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>{onBack && <Button intent="neutral" onClick={onBack}>← Back</Button>}</div>
        <div>{onNext && <Button intent="cool" onClick={onNext}>{nextLabel}</Button>}</div>
      </div>
    </div>
  );
}
