import { useRef, useState } from 'react';
import { Popover, Button } from '@grest-ts/react';

export default function PopoverBasic() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);

  return (
    <>
      <div className="demoLabel" style={{ marginBottom: 12 }}>
        A thin anchored floating layer: positions itself against an element, flips and clamps to stay in the
        viewport, portals to <code>{'<body>'}</code>, and closes on outside-click or Escape. Content is just children.
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span ref={anchorRef} style={{ display: 'inline-flex' }}>
          <Button onClick={() => setOpen(o => !o)}>Toggle popover</Button>
        </span>

        {open && (
          <Popover
            anchor={anchorRef}
            width={260}
            onClose={() => setOpen(false)}
            style={{ width: 260, padding: 12, gap: 8 }}
          >
            <div style={{ fontWeight: 700 }}>Anchored popover</div>
            <div style={{ color: 'var(--rk-text-secondary)' }}>
              Thin anchored layer: positions + flips + clamps, portals to body, closes on
              outside-click or Escape. All content is just children — the component stays out of it.
            </div>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </Popover>
        )}
      </div>
    </>
  );
}
