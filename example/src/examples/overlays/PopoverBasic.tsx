import { useRef, useState, type ReactNode } from 'react';
import { Popover, Button, type PopoverPlacement } from '@grest-ts/react';

function PopoverButton({ label, placement, maxHeight, children }: {
  label: string;
  placement?: PopoverPlacement;
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
          width={240}
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

        <PopoverButton label="Below" placement="below">
          <div style={{ fontWeight: 700 }}>placement="below"</div>
          <div style={{ color: 'var(--rk-text-secondary)' }}>
            Always pins under the anchor; height is still clamped to the space remaining below.
          </div>
        </PopoverButton>

        <PopoverButton label="Above" placement="above">
          <div style={{ fontWeight: 700 }}>placement="above"</div>
          <div style={{ color: 'var(--rk-text-secondary)' }}>
            Always pins over the anchor.
          </div>
        </PopoverButton>

        <PopoverButton label="Horizontal" placement="horizontal">
          <div style={{ fontWeight: 700 }}>placement="horizontal"</div>
          <div style={{ color: 'var(--rk-text-secondary)' }}>
            Opens to the right, falling back to the left, then vertical when neither side fits.
          </div>
        </PopoverButton>

        <PopoverButton label="Scrollable" maxHeight={150}>
          <div style={{ fontWeight: 700 }}>maxHeight + scroll</div>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ color: 'var(--rk-text-secondary)' }}>Item {i + 1}</div>
          ))}
        </PopoverButton>
      </div>
    </>
  );
}
