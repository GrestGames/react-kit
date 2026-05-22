import { Button, toast } from '@grest-ts/react';

export default function ToastBasic() {
  return (
    <>
      <div>Non-blocking toasts (top-right, auto-dismiss, click to close):</div>
      <div>
        <Button onClick={() => { toast.neutral('Plain neutral toast'); }}>Neutral</Button>
        <Button intent="info" onClick={() => { toast.info('Heads up'); }}>Info</Button>
        <Button intent="cool" onClick={() => { toast.cool('Just so you know'); }}>Cool</Button>
        <Button intent="success" onClick={() => { toast.success('Saved successfully'); }}>Success</Button>
        <Button intent="warning" onClick={() => { toast.warning('Double-check this'); }}>Warning</Button>
        <Button intent="danger" onClick={() => { toast.danger('Something went wrong'); }}>Danger</Button>
        <Button intent="critical" onClick={() => { toast.critical('Critical failure'); }}>Critical</Button>
      </div>
    </>
  );
}
