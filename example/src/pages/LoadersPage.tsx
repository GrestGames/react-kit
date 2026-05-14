import ShowCase from '../showcase/ShowCase';

import LoaderShowcase from '../examples/loaders/LoaderShowcase';
import loaderShowcaseSource from '../examples/loaders/LoaderShowcase.tsx?raw';

export default function LoadersPage() {
  return (
    <>
      <h1 className="pageTitle">Loaders</h1>

      <ShowCase title="Step loader — Jarvis variants (fake flow)" source={loaderShowcaseSource}>
        <LoaderShowcase />
      </ShowCase>
    </>
  );
}
