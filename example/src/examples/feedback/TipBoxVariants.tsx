import { TipBox, RkToast } from '@grest-ts/react';

export default function TipBoxVariants() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TipBox>Default <b>TipBox</b> — hints and neutral info.</TipBox>
      <TipBox intent="neutral">intent="neutral" — neutral gray, no status meaning.</TipBox>
      <TipBox intent="info" iconLetter="i">intent="info" — informational note.</TipBox>
      <TipBox intent="success" iconLetter="i">intent="success" — great for confirmations.</TipBox>
      <TipBox intent="warning" iconLetter="!">intent="warning" — draw attention to something.</TipBox>
      <TipBox intent="danger" iconLetter="!">intent="danger" — show errors or critical info.</TipBox>
      <TipBox onClick={() => RkToast('Dismissed')}>TipBox with <b>onClick</b> — click to dismiss.</TipBox>
    </div>
  );
}
