import { useEffect, useMemo } from 'react';
import { PopupPanel, OverlayStackProvider, Button } from '@grest-ts/react';
import { Router, RouterProvider, RouterOutlet, useRouter } from '@grest-ts/react/router';

// Each panel is route-driven and route-agnostic: it just renders a PopupPanel. The app drives
// which panels are open (and their order) via the URL — opening an already-open panel re-adds
// its key, moving it to the end of the URL, which raises it to the top (and moves focus to it).
function DemoPanel({ id }: { id: 'a' | 'b' }) {
  const { router } = useRouter();
  const other = id === 'a' ? 'b' : 'a';
  const label = id.toUpperCase();
  return (
    <PopupPanel title={`Panel ${label}`} width="420px" onClose={() => router.remove(id)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
        <p>Panel {label}. While it's on top, focus is trapped here — press Tab to check.</p>
        <input data-testid={`input-${id}`} placeholder={`Type in panel ${label}…`} />
        <Button onClick={() => router.add({ [other]: '1' })}>
          Open / raise panel {other.toUpperCase()}
        </Button>
      </div>
    </PopupPanel>
  );
}

const routes = {
  'a=?': () => <DemoPanel id="a" />,
  'b=?': () => <DemoPanel id="b" />,
};

export default function OverlayStackDemo() {
  const router = useMemo(() => new Router(routes, ''), []);
  useEffect(() => () => { router.reset(); }, [router]);

  return (
    <RouterProvider router={router}>
      <OverlayStackProvider>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => router.add({ a: '1' })}>Open panel A</Button>
          <Button onClick={() => router.add({ b: '1' })}>Open panel B</Button>
        </div>
        <RouterOutlet />
      </OverlayStackProvider>
    </RouterProvider>
  );
}
