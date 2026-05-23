import { Button, AddNewButton, RkToast } from '@grest-ts/react';

const intents = ['neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'] as const;

export default function ButtonVariants() {
  return (
    <>
      <div className="demoRow">
        {intents.map(intent => (
          <Button key={intent} intent={intent} onClick={() => RkToast(intent)}>{intent}</Button>
        ))}
      </div>
      <div className="demoRow">
        <Button onClick={() => new Promise(r => setTimeout(r, 1500))}>Async (1.5s)</Button>
        <Button onClick={() => {}} disabled>Disabled</Button>
        <AddNewButton onClick={() => RkToast.success('Added a new item')}>Add new item</AddNewButton>
      </div>

      {/* title prop — styled react-kit title, anchored under the control. Accepts rich content. */}
      <div className="demoRow">
        <Button onClick={() => RkToast('Saved')} title="Saves your changes to the server.">Save</Button>
        <Button intent="danger" onClick={() => RkToast.danger('Deleted')}
          title={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontWeight: 700 }}>Permanent delete</div>
              <div>This cannot be undone.</div>
            </div>
          }>Delete</Button>
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
