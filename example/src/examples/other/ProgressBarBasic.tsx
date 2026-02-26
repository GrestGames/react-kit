import { useState } from 'react';
import { ProgressBar, FileIcon, Button } from '@grest-ts/react';

export default function ProgressBarBasic() {
  const [current, setCurrent] = useState(35);

  return (
    <>
      <div className="demoSection">
        <div className="demoLabel">ProgressBar:</div>
        <ProgressBar current={current} total={100} width={300} />
        <div className="demoRow" style={{ marginTop: 8 }}>
          <Button onClick={() => setCurrent(c => Math.max(0, c - 10))}>-10</Button>
          <Button onClick={() => setCurrent(c => Math.min(100, c + 10))}>+10</Button>
          <Button onClick={() => setCurrent(0)}>Reset</Button>
        </div>
      </div>
      <div className="demoSection">
        <div className="demoLabel">FileIcon (by extension):</div>
        <div className="demoRow">
          <div style={{ textAlign: 'center' }}>
            <FileIcon fileName="document.pdf" width={48} height={48} />
            <div style={{ fontSize: 11, color: '#64748b' }}>PDF</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <FileIcon fileName="photo.jpg" width={48} height={48} />
            <div style={{ fontSize: 11, color: '#64748b' }}>JPG</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <FileIcon fileName="data.xlsx" width={48} height={48} />
            <div style={{ fontSize: 11, color: '#64748b' }}>XLSX</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <FileIcon fileName="archive.zip" width={48} height={48} />
            <div style={{ fontSize: 11, color: '#64748b' }}>ZIP</div>
          </div>
        </div>
      </div>
    </>
  );
}
