import { Currency, CurrencyPosNeg, Percent, Sq, FileSize } from '@grest-ts/react';

export default function CurrencyDisplay() {
  return (
    <>
      <table className="table">
        <tbody>
          <tr><td style={{width: 200 }}>Currency:</td><td><Currency value={1234567.89} /></td></tr>
          <tr><td >Currency (0 decimals):</td><td><Currency value={42000} decimals={0} /></td></tr>
          <tr><td >Currency (signAlways):</td><td><Currency value={500} signAlways /></td></tr>
          <tr><td >Currency (negative):</td><td><Currency value={-1250.5} /></td></tr>
          <tr><td >Currency (hide0):</td><td>[<Currency value={0} hide0 />] (hidden when 0)</td></tr>
          <tr><td >CurrencyPosNeg (+):</td><td><CurrencyPosNeg value={750} signAlways /></td></tr>
          <tr><td >CurrencyPosNeg (-):</td><td><CurrencyPosNeg value={-320} /></td></tr>
        </tbody>
      </table>
      <hr />
      <table>
        <tbody>
          <tr><td style={{width: 200 }}>Percent:</td><td><Percent value={85.5} /></td></tr>
          <tr><td>Percent (0 decimals):</td><td><Percent value={33.333} decimals={0} /></td></tr>
          <tr><td>Sq:</td><td><Sq value={125.7} /></td></tr>
          <tr><td>FileSize (bytes):</td><td><FileSize value={512} /></td></tr>
          <tr><td>FileSize (KB):</td><td><FileSize value={15360} /></td></tr>
          <tr><td>FileSize (MB):</td><td><FileSize value={5242880} /></td></tr>
          <tr><td>FileSize (GB):</td><td><FileSize value={2147483648} /></td></tr>
        </tbody>
      </table>
    </>
  );
}
