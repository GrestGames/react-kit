import { CSSProperties } from 'react';
import { ToolTip, MiniTip } from '@grest-ts/react';

export default function ToolTipBasic() {
  return (
    <>
      <div>
        <ToolTip message="This is a tooltip! It follows your cursor.">
          <span style={{padding:"3px",margin: "5px"}}>Hover me (ToolTip)</span>
        </ToolTip>
        <ToolTip message="<b>HTML</b> content works too!<br/>Second line here.">
          <span style={{ padding:"3px",margin: "5px"}}>Hover (HTML tooltip)</span>
        </ToolTip>
        <ToolTip message="Error style tooltip" template="error">
          <span style={{padding:"3px", margin: "5px"}}>Hover (error template)</span>
        </ToolTip>
      </div>
      <div style={{ marginTop: 12 }}>
        <span>MiniTip is small inline hint text: <MiniTip>e.g. a field note</MiniTip></span>
      </div>
    </>
  );
}
