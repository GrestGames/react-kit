import { Button, DangerButton, WarningButton, SecondaryButton, AddNewButton } from '@grest-ts/react';

export default function ButtonVariants() {
  return (
    <>
      <div className="demoRow">
        <Button onClick={() => alert('Clicked!')}>Button</Button>
        <SecondaryButton onClick={() => alert('Secondary!')}>Secondary</SecondaryButton>
        <WarningButton onClick={() => alert('Warning!')}>Warning</WarningButton>
        <DangerButton onClick={() => alert('Danger!')}>Danger</DangerButton>
      </div>
      <div className="demoRow">
        <Button onClick={() => new Promise(r => setTimeout(r, 1500))}>Async (1.5s)</Button>
        <Button onClick={() => {}} disabled>Disabled</Button>
        <AddNewButton onClick={() => alert('Add new!')}>Add new item</AddNewButton>
      </div>
    </>
  );
}
