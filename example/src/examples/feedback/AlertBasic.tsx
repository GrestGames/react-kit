import { useState } from 'react';
import { Alert, Button } from '@grest-ts/react';

export default function AlertBasic() {
  const [shown, setShown] = useState<string | null>(null);
  const close = () => setShown(null);

  return (
    <>
      <div className="demoRow">
        <Button onClick={() => setShown('plain')}>Show Alert (plain)</Button>
        <Button intent="info" onClick={() => setShown('info')}>Show Alert info</Button>
        <Button intent="warning" onClick={() => setShown('warning')}>Show Alert warning</Button>
        <Button intent="danger" onClick={() => setShown('danger')}>Show Alert danger</Button>
        <Button intent="success" onClick={() => setShown('success')}>Show Alert success</Button>
      </div>
      {shown === 'plain' && (
        <Alert title="Heads up!" onClick={close}>This is a standard alert dialog.</Alert>
      )}
      {shown === 'info' && (
        <Alert intent="info" onClick={close}>Here is some information you might want to know.</Alert>
      )}
      {shown === 'warning' && (
        <Alert intent="warning" onClick={close}>This action may have consequences — double-check before continuing.</Alert>
      )}
      {shown === 'danger' && (
        <Alert intent="danger" onClick={close}>An error occurred while processing your request.</Alert>
      )}
      {shown === 'success' && (
        <Alert intent="success" onClick={close}>Your changes have been saved successfully.</Alert>
      )}
    </>
  );
}
