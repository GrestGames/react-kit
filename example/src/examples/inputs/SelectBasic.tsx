import { useState } from 'react';
import { Select, RadioSelect, AutoComplete } from '@grest-ts/react';

const colorOptions = [
  { id: 'red', name: 'Red' },
  { id: 'green', name: 'Green' },
  { id: 'blue', name: 'Blue' },
  { id: 'yellow', name: 'Yellow' },
];

const countryOptions = [
  { id: 1, name: 'Estonia' },
  { id: 2, name: 'Latvia' },
  { id: 3, name: 'Lithuania' },
  { id: 4, name: 'Finland' },
  { id: 5, name: 'Sweden' },
];

export default function SelectBasic() {
  const [color, setColor] = useState<string>('blue');
  const [radio, setRadio] = useState<string>('green');
  const [country, setCountry] = useState<number | null>(1);
  const [asyncVal, setAsyncVal] = useState<number | null>(null);

  return (
    <>
      <div className="demoRow">
        <label>
          Select
          <Select value={color} onChange={(v) => setColor(v as string)} options={colorOptions} />
        </label>
        <label>
          Select (addEmpty)
          <Select value={color} onChange={(v) => setColor(v as string)} options={colorOptions} addEmpty />
        </label>
      </div>
      <div className="demoRow">
        <label>
          RadioSelect
          <RadioSelect value={radio} onChange={(v) => setRadio(v as string)} options={colorOptions} />
        </label>
      </div>
      <div className="demoRow">
        <label>
          AutoComplete (sync options)
          <AutoComplete value={country} onChange={setCountry} options={countryOptions} addEmpty />
        </label>
        <label>
          AutoComplete (async options)
          <AutoComplete
            value={asyncVal}
            onChange={setAsyncVal}
            options={async () => {
              await new Promise(r => setTimeout(r, 500));
              return countryOptions;
            }}
            addEmpty
          />
        </label>
      </div>
    </>
  );
}
