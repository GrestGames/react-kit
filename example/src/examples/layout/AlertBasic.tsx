import { useState } from 'react';
import { Alert, InfoAlert, WarningAlert, ErrorAlert, Button } from '@grest-ts/react';

export default function AlertBasic() {
  const [shown, setShown] = useState<string | null>(null);
  const close = () => setShown(null);

  return (
    <>
      <div className="demoRow">
        <Button onClick={() => setShown('alert')}>Show Alert</Button>
        <Button onClick={() => setShown('info')}>Show InfoAlert</Button>
        <Button onClick={() => setShown('warning')}>Show WarningAlert</Button>
        <Button onClick={() => setShown('error')}>Show ErrorAlert</Button>
      </div>
      {shown === 'alert' && (
        <Alert title="Heads up!" onClick={close}>This is a standard alert dialog.</Alert>
      )}
      {shown === 'info' && (
        <InfoAlert onClick={close}>Here is some information you might want to know.</InfoAlert>
      )}
      {shown === 'warning' && (
        <WarningAlert onClick={close}>This action may have consequences — double-check before continuing.</WarningAlert>
      )}
      {shown === 'error' && (
        <ErrorAlert onClick={close}>An error occurred while processing your request.</ErrorAlert>
      )}
    </>
  );
}
