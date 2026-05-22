import { ToolTip } from '@grest-ts/react';

export default function ToolTipBasic() {
  return (
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
      <ToolTip message="Danger intent tooltip" intent="danger">
        <span style={{padding:"3px", margin: "5px"}}>Hover (intent="danger")</span>
      </ToolTip>
      <ToolTip message="Warning intent tooltip" intent="warning">
        <span style={{padding:"3px", margin: "5px"}}>Hover (intent="warning")</span>
      </ToolTip>
    </div>
  );
}
