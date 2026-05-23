import ShowCase from '../showcase/ShowCase';

import ButtonVariants from '../examples/actions/ButtonVariants';
import buttonVariantsSource from '../examples/actions/ButtonVariants.tsx?raw';

import ButtonIntents from '../examples/actions/ButtonIntents';
import buttonIntentsSource from '../examples/actions/ButtonIntents.tsx?raw';

import IconButtonBasic from '../examples/actions/IconButtonBasic';
import iconButtonBasicSource from '../examples/actions/IconButtonBasic.tsx?raw';

import PillButtonBasic from '../examples/actions/PillButtonBasic';
import pillButtonBasicSource from '../examples/actions/PillButtonBasic.tsx?raw';

import ActionMenuBasic from '../examples/actions/ActionMenuBasic';
import actionMenuBasicSource from '../examples/actions/ActionMenuBasic.tsx?raw';

export default function ActionsPage() {
  return (
    <>
      <h1 className="pageTitle">Buttons & Actions</h1>

      <ShowCase title="Button" source={buttonVariantsSource}>
        <ButtonVariants />
      </ShowCase>

      <ShowCase title="Buttons — one per intent" source={buttonIntentsSource}>
        <ButtonIntents />
      </ShowCase>

      <ShowCase title="IconButton (async spinner, glyph variant, size)" source={iconButtonBasicSource}>
        <IconButtonBasic />
      </ShowCase>

      <ShowCase title="PillButton" source={pillButtonBasicSource}>
        <PillButtonBasic />
      </ShowCase>

      <ShowCase title="ActionMenu" source={actionMenuBasicSource}>
        <ActionMenuBasic />
      </ShowCase>
    </>
  );
}
