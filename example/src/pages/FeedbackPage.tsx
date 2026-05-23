import ShowCase from '../showcase/ShowCase';

import AlertBasic from '../examples/feedback/AlertBasic';
import alertBasicSource from '../examples/feedback/AlertBasic.tsx?raw';

import DialogBasic from '../examples/feedback/DialogBasic';
import dialogBasicSource from '../examples/feedback/DialogBasic.tsx?raw';

import ToastBasic from '../examples/feedback/ToastBasic';
import toastBasicSource from '../examples/feedback/ToastBasic.tsx?raw';

import TipBoxVariants from '../examples/feedback/TipBoxVariants';
import tipBoxVariantsSource from '../examples/feedback/TipBoxVariants.tsx?raw';

import ProgressBarBasic from '../examples/feedback/ProgressBarBasic';
import progressBarBasicSource from '../examples/feedback/ProgressBarBasic.tsx?raw';

import TagVariants from '../examples/feedback/TagVariants';
import tagVariantsSource from '../examples/feedback/TagVariants.tsx?raw';

export default function FeedbackPage() {
  return (
    <>
      <h1 className="pageTitle">Feedback & Status</h1>

      <ShowCase title="Alert" source={alertBasicSource}>
        <AlertBasic />
      </ShowCase>

      <ShowCase title="RkConfirm / RkAlert — imperative dialogs" source={dialogBasicSource}>
        <DialogBasic />
      </ShowCase>

      <ShowCase title="Toast notifications" source={toastBasicSource}>
        <ToastBasic />
      </ShowCase>

      <ShowCase title="TipBox" source={tipBoxVariantsSource}>
        <TipBoxVariants />
      </ShowCase>

      <ShowCase title="ProgressBar" source={progressBarBasicSource}>
        <ProgressBarBasic />
      </ShowCase>

      <ShowCase title="Tag — intents × sizes (micro, small, normal per row)" source={tagVariantsSource}>
        <TagVariants />
      </ShowCase>
    </>
  );
}
