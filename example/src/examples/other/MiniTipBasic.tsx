import { MiniTip } from '@grest-ts/react';

export default function MiniTipBasic() {
  return (
    <>
      <div>
        <span>MiniTip is small inline hint text: <MiniTip>e.g. a field note</MiniTip></span>
      </div>
      <div style={{ marginTop: 8 }}>
        <span>MiniTip with intent: <MiniTip intent="danger">required field</MiniTip> · <MiniTip intent="success">saved</MiniTip></span>
      </div>
    </>
  );
}
