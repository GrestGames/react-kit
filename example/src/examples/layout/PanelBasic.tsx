import { useState } from 'react';
import { PopupPanel, Button } from '@grest-ts/react';

export default function PanelBasic() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <Button onClick={() => setShowPopup(true)}>Open PopupPanel</Button>
      {showPopup && (
        <PopupPanel title="Example Panel" subTitle="A subtitle here" width="500px" onClose={() => setShowPopup(false)}>
            This is a PopupPanel with a dark background overlay.<br />
            Click X or the dark background to close.
        </PopupPanel>
      )}
    </>
  );
}
