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
            <td style={{ width: 200 }}>DatePast (past):</td>
            <td><DatePast date={past} /></td>
          </tr>
          <tr>
            <td >DatePast (future):</td>
            <td><DatePast date={future} /></td>
          </tr>
          <tr>
            <td>DatePast (max):</td>
            <td><DatePast date={DateUtils.MAX_DATE} /></td>
          </tr>
        </tbody>
      </table>
      <hr />
      <table>
        <tbody>
          <tr>
            <td style={{ width: 200 }}>RelativeDate (today):</td>
            <td><RelativeDate date={today} /></td>
          </tr>
          <tr>
            <td>RelativeDate (past):</td>
            <td><RelativeDate date={past} /></td>
          </tr>
          <tr>
            <td>RelativeDate (null):</td>
            <td><RelativeDate date={null} /></td>
          </tr>
        </tbody>
      </table>
      <hr />
      <div>ClickableDate (double-click to open picker):</div>
      <div>
        <ClickableDate date={clickDate} onChange={setClickDate} />
      </div>
    </>
  );
}
