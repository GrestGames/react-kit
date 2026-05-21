import { Button, DangerButton, WarningButton, SecondaryButton, AddNewButton, toast } from '@grest-ts/react';

export default function ButtonVariants() {
  return (
    <>
      <div className="demoRow">
        <Button onClick={() => toast('Button clicked!')}>Button</Button>
        <SecondaryButton onClick={() => toast.info('Secondary clicked')}>Secondary</SecondaryButton>
        <WarningButton onClick={() => toast.warning('Warning — proceed with care')}>Warning</WarningButton>
        <DangerButton onClick={() => toast.error('Danger — something went wrong')}>Danger</DangerButton>
      </div>
      <div className="demoRow">
        <Button onClick={() => new Promise(r => setTimeout(r, 1500))}>Async (1.5s)</Button>
        <Button onClick={() => {}} disabled>Disabled</Button>
        <AddNewButton onClick={() => toast.success('Added a new item')}>Add new item</AddNewButton>
      </div>
    </>
  );
}
