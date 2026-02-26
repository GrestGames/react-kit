import { useState } from 'react';
import { DatePast, RelativeDate, ClickableDate, DateUtils } from '@grest-ts/react';

export default function DateDisplay() {
  const today = DateUtils.dateNow();
  const past = '2020-01-15';
  const future = '2030-12-31';
  const [clickDate, setClickDate] = useState<string | null>(today);

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>DatePast (past):</td>
            <td><DatePast date={past} /></td>
          </tr>
          <tr>
            <td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>DatePast (future):</td>
            <td><DatePast date={future} /></td>
          </tr>
          <tr>
            <td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>DatePast (max):</td>
            <td><DatePast date={DateUtils.MAX_DATE} /></td>
          </tr>
        </tbody>
      </table>
      <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
      <table>
        <tbody>
          <tr>
            <td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>RelativeDate (today):</td>
            <td><RelativeDate date={today} /></td>
          </tr>
          <tr>
            <td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>RelativeDate (past):</td>
            <td><RelativeDate date={past} /></td>
          </tr>
          <tr>
            <td className="demoLabel" style={{ padding: '4px 16px 4px 0' }}>RelativeDate (null):</td>
            <td><RelativeDate date={null} /></td>
          </tr>
        </tbody>
      </table>
      <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
      <div className="demoLabel">ClickableDate (double-click to open picker):</div>
      <div style={{ fontSize: 14, padding: '4px 0' }}>
        <ClickableDate date={clickDate} onChange={setClickDate} />
      </div>
    </>
  );
}
