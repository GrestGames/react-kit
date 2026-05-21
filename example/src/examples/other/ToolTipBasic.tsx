import { CSSProperties } from 'react';
import { ToolTip, MiniTip } from '@grest-ts/react';

const trigger: CSSProperties = {
  padding: '6px 12px',
  background: 'var(--rk-bg-active)',
  color: 'var(--rk-text)',
  border: '1px solid var(--rk-border)',
  borderRadius: 4,
  cursor: 'help',
};

const errorTrigger: CSSProperties = {
  ...trigger,
  background: 'color-mix(in srgb, var(--rk-danger) 12%, transparent)',
  color: 'var(--rk-danger)',
  border: '1px solid color-mix(in srgb, var(--rk-danger) 35%, transparent)',
};

export default function ToolTipBasic() {
  return (
    <>
      <div className="demoRow">
        <ToolTip message="This is a tooltip! It follows your cursor.">
          <span style={trigger}>Hover me (ToolTip)</span>
        </ToolTip>
        <ToolTip message="<b>HTML</b> content works too!<br/>Second line here.">
          <span style={trigger}>Hover (HTML tooltip)</span>
        </ToolTip>
        <ToolTip message="Error style tooltip" template="error">
          <span style={errorTrigger}>Hover (error template)</span>
        </ToolTip>
      </div>
      <div className="demoRow" style={{ marginTop: 12 }}>
        <span>MiniTip is small inline hint text: <MiniTip>e.g. a field note</MiniTip></span>
      </div>
    </>
  );
}
