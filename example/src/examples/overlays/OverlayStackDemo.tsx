import { useEffect, useMemo, useState } from 'react';
import { PopupPanel, Button, LoadingPopup, RkConfirm, RkAlert } from '@grest-ts/react';
import { Router, RouterProvider, RouterOutlet, useRouter } from '@grest-ts/react/router';

function DemoPanel({ id }: { id: 'a' | 'b' }) {
  const { router } = useRouter();
  const [loading, setLoading] = useState(false);
  const other = id === 'a' ? 'b' : 'a';
  const label = id.toUpperCase();
  return (
    <PopupPanel title={`Panel ${label}`} width="440px" onClose={() => router.remove(id)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
        <p>Panel {label}. While it's on top, focus is trapped here — press Tab to check.</p>
        <input data-testid={`input-${id}`} placeholder={`Type in panel ${label}…`} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button onClick={() => router.add({ [other]: '1' })}>Open / raise panel {other.toUpperCase()}</Button>
          <Button onClick={() => RkConfirm({ title: `From panel ${label}`, message: 'Confirm something?' })}>Confirm</Button>
          <Button onClick={() => RkAlert({ title: `From panel ${label}`, message: 'Just so you know.' })}>Alert</Button>
          <Button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}>Loader (1.5s)</Button>
        </div>
      </div>
      {loading && <LoadingPopup title={`Loading from ${label}…`} />}
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
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onClick={() => router.add({ a: '1' })}>Open panel A</Button>
        <Button onClick={() => router.add({ b: '1' })}>Open panel B</Button>
      </div>
      <RouterOutlet />
    </RouterProvider>
  );
}
