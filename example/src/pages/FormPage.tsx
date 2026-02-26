import ShowCase from '../showcase/ShowCase';

import FormBasic from '../examples/form/FormBasic';
import formBasicSource from '../examples/form/FormBasic.tsx?raw';

import GridBasic from '../examples/form/GridBasic';
import gridBasicSource from '../examples/form/GridBasic.tsx?raw';

import EntityTrackerBasic from '../examples/form/EntityTrackerBasic';
import entityTrackerBasicSource from '../examples/form/EntityTrackerBasic.tsx?raw';

export default function FormPage() {
  return (
    <>
      <h1 className="pageTitle">Form & Grid</h1>

      <ShowCase title="useAsyncForm + Form + SubmitButton" source={formBasicSource}>
        <FormBasic />
      </ShowCase>

      <ShowCase title="Grid with filters and sorting" source={gridBasicSource}>
        <GridBasic />
      </ShowCase>

      <ShowCase title="EntityTracker (create / update / delete events)" source={entityTrackerBasicSource}>
        <EntityTrackerBasic />
      </ShowCase>
    </>
  );
}
