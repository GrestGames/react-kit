import { Button, DangerButton, WarningButton, SecondaryButton, AddNewButton, RkToast } from '@grest-ts/react';

export default function ButtonVariants() {
  return (
    <>
      <div className="demoRow">
        <Button onClick={() => RkToast('Button clicked!')}>Button</Button>
        <SecondaryButton onClick={() => RkToast.info('Secondary clicked')}>Secondary</SecondaryButton>
        <WarningButton onClick={() => RkToast.warning('Warning — proceed with care')}>Warning</WarningButton>
        <DangerButton onClick={() => RkToast.danger('Danger — something went wrong')}>Danger</DangerButton>
      </div>
      <div className="demoRow">
        <Button onClick={() => new Promise(r => setTimeout(r, 1500))}>Async (1.5s)</Button>
        <Button onClick={() => {}} disabled>Disabled</Button>
        <AddNewButton onClick={() => RkToast.success('Added a new item')}>Add new item</AddNewButton>
      </div>

      {/* appearance="outline" — also auto-applied to buttons inside <Grid> */}
      <div className="demoRow">
        <Button appearance="outline" onClick={() => RkToast('Outline')}>Outline</Button>
        <Button appearance="outline" intent="cool" onClick={() => RkToast.info('Outline secondary')}>Secondary</Button>
        <Button appearance="outline" intent="warning" onClick={() => RkToast.warning('Outline warning')}>Warning</Button>
        <Button appearance="outline" intent="danger" onClick={() => RkToast.danger('Outline danger')}>Danger</Button>
      </div>

      {/* confirmDouble — first click arms a pulsing ring + confirm label (sized to fit, so width never changes),
          a second click within ~2s fires. The label adapts to button width: "?" / "Sure?" / the full phrase. */}
      <div className="demoRow">
        <Button intent="danger" confirmDouble onClick={() => RkToast.danger('Deleted')}>Go</Button>
        <Button intent="danger" confirmDouble onClick={() => RkToast.danger('Deleted')}>Delete</Button>
        <Button confirmDouble onClick={() => RkToast.warning('Reset')}>Reset everything to defaults</Button>
      </div>
    </>
  );
}
