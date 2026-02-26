import { useState } from 'react';
import { IntegerInput, DecimalInput, PositiveIntegerInput, PositiveDecimalInput, InputRange } from '@grest-ts/react';

export default function NumberInputBasic() {
  const [int, setInt] = useState<number | null>(42);
  const [dec, setDec] = useState<number | null>(3.14);
  const [posInt, setPosInt] = useState<number | null>(10);
  const [posDec, setPosDec] = useState<number | null>(99.99);
  const [rangeFrom, setRangeFrom] = useState<number | null>(0);
  const [rangeTo, setRangeTo] = useState<number | null>(100);

  return (
    <>
      <div className="demoRow">
        <label>
          IntegerInput
          <IntegerInput value={int} onChange={setInt} />
        </label>
        <label>
          DecimalInput
          <DecimalInput value={dec} onChange={setDec} />
        </label>
        <label>
          PositiveIntegerInput
          <PositiveIntegerInput value={posInt} onChange={setPosInt} />
        </label>
        <label>
          PositiveDecimalInput
          <PositiveDecimalInput value={posDec} onChange={setPosDec} />
        </label>
      </div>
      <div className="demoRow">
        <label>
          IntegerInput with suffix
          <IntegerInput value={int} onChange={setInt} suffix="pcs" />
        </label>
        <label>
          DecimalInput (4 decimals)
          <DecimalInput value={dec} onChange={setDec} fractionDigits={4} />
        </label>
      </div>
      <div className="demoRow">
        <label>
          InputRange
          <InputRange>
            {[
              <IntegerInput value={rangeFrom} onChange={setRangeFrom} />,
              <IntegerInput value={rangeTo} onChange={setRangeTo} />
            ]}
          </InputRange>
        </label>
      </div>
    </>
  );
}
