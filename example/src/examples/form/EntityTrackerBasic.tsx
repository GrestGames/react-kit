import { useState, useEffect } from 'react';
import { Tracker, TrackerOperation, Button } from '@grest-ts/react';

const tracker = new Tracker<number>();

export default function EntityTrackerBasic() {
  const [log, setLog] = useState<string[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    return tracker.listen((id, operation) => {
      setLog(prev => [...prev, `${operation.toUpperCase()} id=${id} at ${new Date().toLocaleTimeString()}`]);
    });
  }, []);

  return (
    <>
      <div className="demoRow">
        <Button onClick={() => { tracker.create(nextId); setNextId(n => n + 1); }}>
          Create (id={nextId})
        </Button>
        <Button onClick={() => tracker.update(nextId - 1)}>
          Update (id={nextId - 1})
        </Button>
        <Button onClick={() => tracker.delete(nextId - 1)}>
          Delete (id={nextId - 1})
        </Button>
        <Button onClick={() => setLog([])}>Clear log</Button>
      </div>
      <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, maxHeight: 150, overflowY: 'auto', background: '#f8fafc', padding: 8, borderRadius: 4 }}>
        {log.length === 0 && <span style={{ color: '#94a3b8' }}>Click buttons to fire tracker events...</span>}
        {log.map((entry, i) => <div key={i}>{entry}</div>)}
      </div>
    </>
  );
}
