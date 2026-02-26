import { Currency, CurrencyPosNeg, Percent, Sq, FileSize } from '@grest-ts/react';

export default function CurrencyDisplay() {
  return (
    <>
      <table>
        <tbody>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>Currency:</td><td><Currency value={1234567.89} /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>Currency (0 decimals):</td><td><Currency value={42000} decimals={0} /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>Currency (signAlways):</td><td><Currency value={500} signAlways /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>Currency (negative):</td><td><Currency value={-1250.5} /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>Currency (hide0):</td><td>[<Currency value={0} hide0 />] (hidden when 0)</td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>CurrencyPosNeg (+):</td><td><CurrencyPosNeg value={750} signAlways /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>CurrencyPosNeg (-):</td><td><CurrencyPosNeg value={-320} /></td></tr>
        </tbody>
      </table>
      <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
      <table>
        <tbody>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>Percent:</td><td><Percent value={85.5} /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>Percent (0 decimals):</td><td><Percent value={33.333} decimals={0} /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>Sq:</td><td><Sq value={125.7} /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>FileSize (bytes):</td><td><FileSize value={512} /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>FileSize (KB):</td><td><FileSize value={15360} /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>FileSize (MB):</td><td><FileSize value={5242880} /></td></tr>
          <tr><td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>FileSize (GB):</td><td><FileSize value={2147483648} /></td></tr>
        </tbody>
      </table>
    </>
  );
}
