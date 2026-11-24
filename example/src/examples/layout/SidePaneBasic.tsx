import { useState } from 'react';
import { SidePane } from '@grest-ts/react';

export default function SidePaneBasic() {
  const [left, setLeft] = useState(220);
  const [right, setRight] = useState(200);
  return (
    <div style={{ display: 'flex', height: 240, border: '1px solid var(--rk-border)', background: 'var(--rk-bg-surface)' }}>
      <SidePane width={left} onWidthChange={setLeft} minWidth={140} minContentWidth={200}>
        <div style={{ padding: 12 }}>Left pane: {Math.round(left)}px. Drag its right edge.</div>
      </SidePane>
      <div style={{ flex: 1, padding: 12, minWidth: 0 }}>Content keeps at least 200px.</div>
      <SidePane side="right" width={right} onWidthChange={setRight} minWidth={140} maxWidth={360}>
        <div style={{ padding: 12 }}>Right pane: {Math.round(right)}px (max 360). Drag its left edge.</div>
      </SidePane>
    </div>
  );
}
