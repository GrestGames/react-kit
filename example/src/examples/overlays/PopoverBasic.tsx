import { useRef, useState, type ReactNode } from 'react';
import { Popover, Button, RkConfirm, type OverlayPlacement } from '@grest-ts/react';

function PopoverButton({ label, placement, maxHeight, children }: {
  label: string;
  placement?: OverlayPlacement;
  maxHeight?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span ref={anchorRef} style={{ display: 'inline-flex' }}>
        <Button appearance="outline" onClick={() => setOpen(o => !o)}>{label}</Button>
      </span>
      {open && (
        <Popover
          anchor={anchorRef}
          placement={placement}
          maxHeight={maxHeight}
          onClose={() => setOpen(false)}
          style={{ width: 240, padding: 12, gap: 8, overflowY: maxHeight ? 'auto' : undefined }}
        >
          {children}
        </Popover>
      )}
    </>
  );
}

export default function PopoverBasic() {
  return (
    <>
      <div className="demoLabel" style={{ marginBottom: 12 }}>
        A thin anchored floating layer: positions itself against an element, flips and clamps to stay in the
        viewport, portals to <code>{'<body>'}</code>, and closes on outside-click or Escape. The <code>placement</code> prop
        steers the direction; content is just children.
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <PopoverButton label="Auto">
          <div style={{ fontWeight: 700 }}>Auto (vertical)</div>
          <div style={{ color: 'var(--rk-text-secondary)' }}>
            The default — opens below the anchor, or flips above when there's more room there.
          </div>
        </PopoverButton>

        <PopoverButton label="Bottom" placement="bottom-start">
          <div style={{ fontWeight: 700 }}>placement="bottom-start"</div>
          <div style={{ color: 'var(--rk-text-secondary)' }}>
            Opens under the anchor, start-aligned; flips above and clamps height to stay on-screen.
          </div>
        </PopoverButton>

        <PopoverButton label="Top" placement="top-start">
          <div style={{ fontWeight: 700 }}>placement="top-start"</div>
          <div style={{ color: 'var(--rk-text-secondary)' }}>
            Opens over the anchor, start-aligned; flips below when there's more room there.
          </div>
        </PopoverButton>

        <PopoverButton label="Right" placement="right-start">
          <div style={{ fontWeight: 700 }}>placement="right-start"</div>
          <div style={{ color: 'var(--rk-text-secondary)' }}>
            Opens to the right, falling back to the left, then vertical when neither side fits.
          </div>
        </PopoverButton>

        <PopoverButton label="Over" placement="over">
          <div style={{ fontWeight: 700 }}>placement="over"</div>
          <div style={{ color: 'var(--rk-text-secondary)' }}>
            Centers on top of the anchor instead of beside it.
          </div>
        </PopoverButton>

        <PopoverButton label="Scrollable" maxHeight={150}>
          <div style={{ fontWeight: 700 }}>maxHeight + scroll</div>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ color: 'var(--rk-text-secondary)' }}>Item {i + 1}</div>
          ))}
        </PopoverButton>

        <PopoverButton label="Confirm inside">
          <div style={{ fontWeight: 700 }}>Dialog over a popover</div>
          <div style={{ color: 'var(--rk-text-secondary)' }}>
            An <code>RkConfirm</code>/<code>RkAlert</code> opens above the popover in the overlay
            stack, so the popover stops listening for outside-presses while it's up — clicking the
            dialog (or dismissing it) leaves this popover open.
          </div>
          <Button onClick={() => void RkConfirm.warning({ title: 'Confirm', message: 'This dialog opens over the popover. The popover should still be here afterwards.' })}>
            Run confirm
          </Button>
        </PopoverButton>
      </div>
    </>
  );
}
