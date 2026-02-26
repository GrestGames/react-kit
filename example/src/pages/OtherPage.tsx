import ShowCase from '../showcase/ShowCase';

import TipBoxVariants from '../examples/other/TipBoxVariants';
import tipBoxVariantsSource from '../examples/other/TipBoxVariants.tsx?raw';

import ToolTipBasic from '../examples/other/ToolTipBasic';
import toolTipBasicSource from '../examples/other/ToolTipBasic.tsx?raw';

import ActionMenuBasic from '../examples/other/ActionMenuBasic';
import actionMenuBasicSource from '../examples/other/ActionMenuBasic.tsx?raw';

import ProgressBarBasic from '../examples/other/ProgressBarBasic';
import progressBarBasicSource from '../examples/other/ProgressBarBasic.tsx?raw';

export default function OtherPage() {
  return (
    <>
      <h1 className="pageTitle">Other UI</h1>

      <ShowCase title="TipBox, SuccessBox, ErrorBox, WarningBox" source={tipBoxVariantsSource}>
        <TipBoxVariants />
      </ShowCase>

      <ShowCase title="ToolTip, MiniTip" source={toolTipBasicSource}>
        <ToolTipBasic />
      </ShowCase>

      <ShowCase title="ActionMenu, PillButton, Separator" source={actionMenuBasicSource}>
        <ActionMenuBasic />
      </ShowCase>

      <ShowCase title="ProgressBar, FileIcon" source={progressBarBasicSource}>
        <ProgressBarBasic />
      </ShowCase>
    </>
  );
}
