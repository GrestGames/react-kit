import ShowCase from '../showcase/ShowCase';
import ButtonShowcase from '../examples/buttons/ButtonShowcase';
import buttonShowcaseSource from '../examples/buttons/ButtonShowcase.tsx?raw';

export default function ButtonsPage() {
  return (
    <>
      <h1 className="pageTitle">Buttons</h1>

      <ShowCase
        title="Tag · Pill · Button — playground, side-by-side comparison table, custom sections"
        source={buttonShowcaseSource}
      >
        <ButtonShowcase />
      </ShowCase>
    </>
  );
}
