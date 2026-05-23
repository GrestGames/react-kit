import ShowCase from '../showcase/ShowCase';

import PopoverBasic from '../examples/overlays/PopoverBasic';
import popoverBasicSource from '../examples/overlays/PopoverBasic.tsx?raw';

import ToolTipBasic from '../examples/overlays/ToolTipBasic';
import toolTipBasicSource from '../examples/overlays/ToolTipBasic.tsx?raw';

import MiniTipBasic from '../examples/overlays/MiniTipBasic';
import miniTipBasicSource from '../examples/overlays/MiniTipBasic.tsx?raw';

import LoadingPopupBasic from '../examples/overlays/LoadingPopupBasic';
import loadingPopupBasicSource from '../examples/overlays/LoadingPopupBasic.tsx?raw';

import DialogBasic from '../examples/overlays/DialogBasic';
import dialogBasicSource from '../examples/overlays/DialogBasic.tsx?raw';

export default function OverlaysPage() {
  return (
    <>
      <h1 className="pageTitle">Overlays</h1>

      <ShowCase title="Popover" source={popoverBasicSource}>
        <PopoverBasic />
      </ShowCase>

      <ShowCase title="ToolTip" source={toolTipBasicSource}>
        <ToolTipBasic />
      </ShowCase>

      <ShowCase title="MiniTip" source={miniTipBasicSource}>
        <MiniTipBasic />
      </ShowCase>

      <ShowCase title="LoadingPopup, BatchProgressPopup" source={loadingPopupBasicSource}>
        <LoadingPopupBasic />
      </ShowCase>

      <ShowCase title="RkConfirm / RkAlert — imperative dialogs" source={dialogBasicSource}>
        <DialogBasic />
      </ShowCase>
    </>
  );
}
