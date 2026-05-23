import ShowCase from '../showcase/ShowCase';

import CurrencyDisplay from '../examples/display/CurrencyDisplay';
import currencyDisplaySource from '../examples/display/CurrencyDisplay.tsx?raw';

import DateDisplay from '../examples/display/DateDisplay';
import dateDisplaySource from '../examples/display/DateDisplay.tsx?raw';

import FileIconBasic from '../examples/display/FileIconBasic';
import fileIconBasicSource from '../examples/display/FileIconBasic.tsx?raw';

export default function DataDisplayPage() {
  return (
    <>
      <h1 className="pageTitle">Data Display</h1>

      <ShowCase title="Currency, CurrencyPosNeg, Percent, Sq, FileSize" source={currencyDisplaySource}>
        <CurrencyDisplay />
      </ShowCase>

      <ShowCase title="DatePast, RelativeDate, ClickableDate" source={dateDisplaySource}>
        <DateDisplay />
      </ShowCase>

      <ShowCase title="FileIcon" source={fileIconBasicSource}>
        <FileIconBasic />
      </ShowCase>
    </>
  );
}
