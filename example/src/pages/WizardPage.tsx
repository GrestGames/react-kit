import ShowCase from '../showcase/ShowCase';

import WizardBasic from '../examples/wizard/WizardBasic';
import wizardBasicSource from '../examples/wizard/WizardBasic.tsx?raw';

import StepBarCustomColor from '../examples/wizard/StepBarCustomColor';
import stepBarCustomColorSource from '../examples/wizard/StepBarCustomColor.tsx?raw';

export default function WizardPage() {
  return (
    <>
      <h1 className="pageTitle">Wizard / Stepper</h1>

      <ShowCase
        title="StepBar + SlideDeck + AutoHeight"
        source={wizardBasicSource}
      >
        <WizardBasic />
      </ShowCase>

      <ShowCase
        title="StepBar — color prop"
        source={stepBarCustomColorSource}
      >
        <StepBarCustomColor />
      </ShowCase>
    </>
  );
}
