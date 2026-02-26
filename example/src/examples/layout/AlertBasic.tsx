import { useState } from 'react';
import { Alert, ErrorAlert, Button } from '@grest-ts/react';

export default function AlertBasic() {
  const [showAlert, setShowAlert] = useState(false);
  const [showError, setShowError] = useState(false);

  return (
    <>
      <div className="demoRow">
        <Button onClick={() => setShowAlert(true)}>Show Alert</Button>
        <Button onClick={() => setShowError(true)}>Show ErrorAlert</Button>
      </div>
      {showAlert && (
        <Alert title="Heads up!" onClick={() => setShowAlert(false)}>
          This is a standard alert dialog.
        </Alert>
      )}
      {showError && (
        <ErrorAlert title="Something went wrong" onClick={() => setShowError(false)}>
          An error occurred while processing your request.
        </ErrorAlert>
      )}
    </>
  );
}
