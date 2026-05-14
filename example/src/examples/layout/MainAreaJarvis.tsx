import { MainArea, Button, useErrorTracker } from '@grest-ts/react';

export default function MainAreaJarvis() {
  const tracker = useErrorTracker();

  return (
    <>
      <div className="demoLabel">
        <code>MainArea</code> with <code>showJarvis</code> — the orb idles in the desktop
        area, and switches to its "alert" mood while a notification is present. Trigger
        one, then dismiss the error box at the top of the page to see it settle back.
      </div>
      <MainArea
        showJarvis
        style={{
          minHeight: 260,
          borderRadius: 8,
          padding: 16,
          background: '#0a0e14',
          color: '#cbd5e1',
        }}
      >
        <div>Desktop area content goes here.</div>
        <div className="demoRow" style={{ marginTop: 12 }}>
          <Button onClick={() => tracker.addError('Jarvis noticed something')}>
            Trigger notification
          </Button>
        </div>
      </MainArea>
    </>
  );
}
