import { TipBox, SuccessBox, ErrorBox, WarningBox } from '@grest-ts/react';

export default function TipBoxVariants() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TipBox>This is a <b>TipBox</b> — use it for hints and neutral info.</TipBox>
      <SuccessBox>This is a <b>SuccessBox</b> — great for confirmations.</SuccessBox>
      <WarningBox>This is a <b>WarningBox</b> — draw attention to something.</WarningBox>
      <ErrorBox>This is an <b>ErrorBox</b> — show errors or critical info.</ErrorBox>
      <TipBox onClick={() => alert('Dismissed!')}>TipBox with <b>onClick</b> — click to dismiss.</TipBox>
    </div>
  );
}
