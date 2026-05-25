import ShowCase from '../showcase/ShowCase';
import ButtonShowcase from '../examples/buttons/ButtonShowcase';
import buttonShowcaseSource from '../examples/buttons/ButtonShowcase.tsx?raw';

export default function ButtonsPage() {
  return (
    <>
      <h1 className="pageTitle">Buttons V2</h1>

      <ShowCase
        title="Tag · Pill · Button — V2 restructure: playground-first, side-by-side table, custom sections"
        source={buttonShowcaseSource}
      >
        <ButtonShowcase />
      </ShowCase>
    </>
  );
}
