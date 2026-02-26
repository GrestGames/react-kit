import { useState } from 'react';
import { FileUpload, FileMultiUpload } from '@grest-ts/react';
import type { GGFile } from '@grest-ts/schema-file';

export default function FileUploadBasic() {
  const [single, setSingle] = useState<GGFile | null>(null);
  const [multi, setMulti] = useState<GGFile[]>([]);

  return (
    <div className="demoRow">
      <label style={{ width: 280 }}>
        FileUpload (single)
        <FileUpload value={single} onChange={setSingle} />
      </label>
      <label style={{ width: 280 }}>
        FileMultiUpload (multiple)
        <FileMultiUpload value={multi} onChange={setMulti} />
      </label>
    </div>
  );
}
