import ShowCase from '../showcase/ShowCase';

import TipBoxVariants from '../examples/other/TipBoxVariants';
import tipBoxVariantsSource from '../examples/other/TipBoxVariants.tsx?raw';

import TagVariants from '../examples/other/TagVariants';
import tagVariantsSource from '../examples/other/TagVariants.tsx?raw';

import ButtonIntents from '../examples/other/ButtonIntents';
import buttonIntentsSource from '../examples/other/ButtonIntents.tsx?raw';

import ToolTipBasic from '../examples/other/ToolTipBasic';
import toolTipBasicSource from '../examples/other/ToolTipBasic.tsx?raw';

import ToolTipV2Basic from '../examples/other/ToolTipV2Basic';
import toolTipV2BasicSource from '../examples/other/ToolTipV2Basic.tsx?raw';

import MiniTipBasic from '../examples/other/MiniTipBasic';
import miniTipBasicSource from '../examples/other/MiniTipBasic.tsx?raw';

import ToastBasic from '../examples/other/ToastBasic';
import toastBasicSource from '../examples/other/ToastBasic.tsx?raw';

import DialogBasic from '../examples/other/DialogBasic';
import dialogBasicSource from '../examples/other/DialogBasic.tsx?raw';

import PopoverBasic from '../examples/other/PopoverBasic';
import popoverBasicSource from '../examples/other/PopoverBasic.tsx?raw';

import PillButtonBasic from '../examples/other/PillButtonBasic';
import pillButtonBasicSource from '../examples/other/PillButtonBasic.tsx?raw';

import ProgressBarBasic from '../examples/other/ProgressBarBasic';
import progressBarBasicSource from '../examples/other/ProgressBarBasic.tsx?raw';

import FileIconBasic from '../examples/other/FileIconBasic';
import fileIconBasicSource from '../examples/other/FileIconBasic.tsx?raw';

export default function OtherPage() {
  return (
    <>
      <h1 className="pageTitle">Other UI</h1>

      <ShowCase title="TipBox, NeutralTipBox, SuccessBox, ErrorBox, WarningBox" source={tipBoxVariantsSource}>
        <TipBoxVariants />
      </ShowCase>

      <ShowCase title="Tag — intents × sizes (micro, small, normal per row)" source={tagVariantsSource}>
        <TagVariants />
      </ShowCase>

      <ShowCase title="Buttons — one per intent" source={buttonIntentsSource}>
        <ButtonIntents />
      </ShowCase>

      <ShowCase title="PillButton" source={pillButtonBasicSource}>
        <PillButtonBasic />
      </ShowCase>

      <ShowCase title="Toast notifications" source={toastBasicSource}>
        <ToastBasic />
      </ShowCase>

      <ShowCase title="RkConfirm / RkAlert — imperative dialogs" source={dialogBasicSource}>
        <DialogBasic />
      </ShowCase>

      <ShowCase title="ToolTip" source={toolTipBasicSource}>
        <ToolTipBasic />
      </ShowCase>

      <ShowCase title="ToolTipV2 (Floating UI) — incl. Button tooltip" source={toolTipV2BasicSource}>
        <ToolTipV2Basic />
      </ShowCase>

      <ShowCase title="Popover" source={popoverBasicSource}>
        <PopoverBasic />
      </ShowCase>

      <ShowCase title="MiniTip" source={miniTipBasicSource}>
        <MiniTipBasic />
      </ShowCase>

      <ShowCase title="ProgressBar" source={progressBarBasicSource}>
        <ProgressBarBasic />
      </ShowCase>

      <ShowCase title="FileIcon" source={fileIconBasicSource}>
        <FileIconBasic />
      </ShowCase>
    </>
  );
}
