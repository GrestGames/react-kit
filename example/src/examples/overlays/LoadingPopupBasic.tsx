import { useState } from 'react';
import { LoadingPopup, BatchProgressPopup, Button } from '@grest-ts/react';
import type { BatchProgress } from '@grest-ts/react';

export default function LoadingPopupBasic() {
  const [showLoading, setShowLoading] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    sent: 0, errors: 0, handled: 0, total: 10, failures: [],
  });

  const startLoading = () => {
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), 2000);
  };

  const startBatch = () => {
    const progress: BatchProgress = { sent: 0, errors: 0, handled: 0, total: 5, failures: [] };
    setBatchProgress({ ...progress });
    setShowBatch(true);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      progress.handled = i;
      if (i === 3) {
        progress.errors = 1;
        progress.sent = i - 1;
        progress.failures.push({ id: 3, reason: 'Simulated failure' });
      } else {
        progress.sent = progress.handled - progress.errors;
      }
      setBatchProgress({ ...progress });
      if (i >= 5) clearInterval(interval);
    }, 600);
  };

  return (
    <>
      <div>
        <Button onClick={startLoading}>Show LoadingPopup (2s)</Button>
        <Button onClick={startBatch}>Show BatchProgressPopup</Button>
      </div>
      {showLoading && <LoadingPopup title="Processing..." />}
      {showBatch && (
        <BatchProgressPopup
          title="Sending emails..."
          progress={batchProgress}
          onDone={() => setShowBatch(false)}
        />
      )}
    </>
  );
}
