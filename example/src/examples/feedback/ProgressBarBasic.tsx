import { useState } from 'react';
import { ProgressBar, Button } from '@grest-ts/react';

export default function ProgressBarBasic() {
  const [current, setCurrent] = useState(35);

  return (
    <div>
      <ProgressBar current={current} total={100} width={300} />
      <div style={{ marginTop: 8 }}>
        <Button onClick={() => setCurrent(c => Math.max(0, c - 10))}>-10</Button>
        <Button onClick={() => setCurrent(c => Math.min(100, c + 10))}>+10</Button>
        <Button onClick={() => setCurrent(0)}>Reset</Button>
      </div>
    </div>
  );
}
