import { Button, RkConfirm, RkAlert, RkToast } from '@grest-ts/react';

export default function DialogBasic() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button onClick={async () => {
        const ok = await RkConfirm({ title: 'Delete file?', message: 'This cannot be undone.' });
        RkToast(ok ? 'Confirmed' : 'Cancelled');
      }}>Confirm</Button>

      <Button intent="danger" onClick={async () => {
        const ok = await RkConfirm.danger({ title: 'Delete everything?', message: 'All data will be permanently removed.', confirmLabel: 'Delete' });
        RkToast(ok ? 'Deleted' : 'Kept', { intent: ok ? 'danger' : 'neutral' });
      }}>Confirm (danger)</Button>

      <Button intent="info" onClick={() => RkAlert.info({ title: 'Heads up', message: 'Your session expires in 5 minutes.' })}>Alert (info)</Button>

      <Button intent="warning" onClick={() => RkAlert.warning({ title: 'Careful', message: 'This feature is experimental.' })}>Alert (warning)</Button>
    </div>
  );
}
