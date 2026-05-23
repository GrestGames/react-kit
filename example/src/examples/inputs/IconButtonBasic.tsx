import { IconButton, RkToast } from '@grest-ts/react';

export default function IconButtonBasic() {
  return (
    <>
      <div className="demoRow">
        <IconButton icon="✎" title="Edit" onClick={() => { RkToast.info('Edit'); }} />
        <IconButton icon="⧉" title="Copy" onClick={() => { RkToast.success('Copied'); }} />
        <IconButton icon="↻" title="Async (1.2s) — shows a spinner" onClick={() => new Promise(r => setTimeout(r, 1200))} />
        <IconButton icon="🗑" title="Disabled" onClick={() => {}} disabled />
      </div>
      <div className="demoRow">
        <IconButton icon="★" title="Glyph variant" variant="glyph" color="#f0c040" onClick={() => { RkToast('Star'); }} />
        <IconButton icon="⚙" title="Bigger (size 22)" size={22} onClick={() => { RkToast('Settings'); }} />
      </div>
    </>
  );
}
