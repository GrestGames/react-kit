import { FileIcon } from '@grest-ts/react';

export default function FileIconBasic() {
  return (
    <div>
      <FileIcon fileName="document.pdf" width={48} height={48} />
      <FileIcon fileName="photo.jpg" width={48} height={48} />
      <FileIcon fileName="data.xlsx" width={48} height={48} />
      <FileIcon fileName="archive.zip" width={48} height={48} />
    </div>
  );
}
