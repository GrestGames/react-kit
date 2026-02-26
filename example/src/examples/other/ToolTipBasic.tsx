import { ToolTip, MiniTip } from '@grest-ts/react';

export default function ToolTipBasic() {
  return (
    <>
      <div className="demoRow">
        <ToolTip message="This is a tooltip! It follows your cursor.">
          <span style={{ padding: '6px 12px', background: '#e2e8f0', borderRadius: 4, cursor: 'help' }}>
            Hover me (ToolTip)
          </span>
        </ToolTip>
        <ToolTip message="<b>HTML</b> content works too!<br/>Second line here.">
          <span style={{ padding: '6px 12px', background: '#e2e8f0', borderRadius: 4, cursor: 'help' }}>
            Hover (HTML tooltip)
          </span>
        </ToolTip>
        <ToolTip message="Error style tooltip" template="error">
          <span style={{ padding: '6px 12px', background: '#fee2e2', borderRadius: 4, cursor: 'help' }}>
            Hover (error template)
          </span>
        </ToolTip>
      </div>
      <div className="demoRow" style={{ marginTop: 12 }}>
        <span>MiniTip: <MiniTip>This is a small inline tip</MiniTip></span>
      </div>
    </>
  );
}
