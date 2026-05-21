import { Button, toast } from '@grest-ts/react';

export default function ToastBasic() {
  return (
    <>
      <div className="demoLabel">Non-blocking toasts (top-right, auto-dismiss, click to close):</div>
      <div className="demoRow">
        <Button onClick={() => toast('Plain info toast')}>Info</Button>
        <Button onClick={() => toast.success('Saved successfully')}>Success</Button>
        <Button onClick={() => toast.warning('Heads up — double-check this')}>Warning</Button>
        <Button onClick={() => toast.error('Something went wrong')}>Error</Button>
      </div>
    </>
  );
}
