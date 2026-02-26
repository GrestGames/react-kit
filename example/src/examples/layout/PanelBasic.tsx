import { useState } from 'react';
import { PopupPanel, Button } from '@grest-ts/react';

export default function PanelBasic() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <Button onClick={() => setShowPopup(true)}>Open PopupPanel</Button>
      {showPopup && (
        <PopupPanel title="Example Panel" subTitle="A subtitle here" width="500px" onClose={() => setShowPopup(false)}>
          <div style={{ padding: 16 }}>
            <p>This is a PopupPanel with a dark background overlay.</p>
            <p style={{ marginTop: 8 }}>Click X or the dark background to close.</p>
          </div>
        </PopupPanel>
      )}
    </>
  );
}
