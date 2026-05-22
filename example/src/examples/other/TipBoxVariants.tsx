import { TipBox, NeutralTipBox, SuccessBox, ErrorBox, WarningBox, toast } from '@grest-ts/react';

export default function TipBoxVariants() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TipBox>This is a <b>TipBox</b> — use it for hints and neutral info.</TipBox>
      <NeutralTipBox>This is a <b>NeutralTipBox</b> — neutral gray, no status meaning.</NeutralTipBox>
      <SuccessBox>This is a <b>SuccessBox</b> — great for confirmations.</SuccessBox>
      <WarningBox>This is a <b>WarningBox</b> — draw attention to something.</WarningBox>
      <ErrorBox>This is an <b>ErrorBox</b> — show errors or critical info.</ErrorBox>
      <TipBox onClick={() => toast('Dismissed')}>TipBox with <b>onClick</b> — click to dismiss.</TipBox>
    </div>
  );
}
