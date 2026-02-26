import ShowCase from '../showcase/ShowCase';

import CurrencyDisplay from '../examples/text/CurrencyDisplay';
import currencyDisplaySource from '../examples/text/CurrencyDisplay.tsx?raw';

import DateDisplay from '../examples/text/DateDisplay';
import dateDisplaySource from '../examples/text/DateDisplay.tsx?raw';

export default function TextPage() {
  return (
    <>
      <h1 className="pageTitle">Text Display</h1>

      <ShowCase title="Currency, CurrencyPosNeg, Percent, Sq, FileSize" source={currencyDisplaySource}>
        <CurrencyDisplay />
      </ShowCase>

      <ShowCase title="DatePast, RelativeDate, ClickableDate" source={dateDisplaySource}>
        <DateDisplay />
      </ShowCase>
    </>
  );
}
