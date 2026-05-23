import { Button, RkToast } from '@grest-ts/react';

export default function ToastBasic() {
  return (
    <>
      <div>Non-blocking toasts (top-right, auto-dismiss, click to close):</div>
      <div>
        <Button onClick={() => { RkToast.neutral('Plain neutral RkToast'); }}>Neutral</Button>
        <Button intent="info" onClick={() => { RkToast.info('Heads up'); }}>Info</Button>
        <Button intent="cool" onClick={() => { RkToast.cool('Just so you know'); }}>Cool</Button>
        <Button intent="success" onClick={() => { RkToast.success('Saved successfully'); }}>Success</Button>
        <Button intent="warning" onClick={() => { RkToast.warning('Double-check this'); }}>Warning</Button>
        <Button intent="danger" onClick={() => { RkToast.danger('Something went wrong'); }}>Danger</Button>
        <Button intent="critical" onClick={() => { RkToast.critical('Critical failure'); }}>Critical</Button>
      </div>
    </>
  );
}
