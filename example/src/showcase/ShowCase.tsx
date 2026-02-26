import { ReactNode, useState } from 'react';

interface Props {
  title: string;
  source: string;
  children: ReactNode;
}

export default function ShowCase({ title, source, children }: Props) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="showcase">
      <div className="showcaseHeader">
        <span className="showcaseTitle">{title}</span>
        <button className="showcaseToggle" onClick={() => setShowCode(!showCode)}>
          {showCode ? 'Hide code' : 'Show code'}
        </button>
      </div>
      <div className="showcaseBody">{children}</div>
      {showCode && (
        <div className="showcaseCode">
          <pre><code>{source}</code></pre>
        </div>
      )}
    </div>
  );
}
