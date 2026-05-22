import ShowCase from '../showcase/ShowCase';
import Elements, { elementColumns, intents } from '../examples/intent/Elements';
import elementsSource from '../examples/intent/Elements.tsx?raw';

export default function IntentPage() {
  return (
    <>
      <h1 className="pageTitle">Intent</h1>
      <p className="demoLabel">
        Each row passes one intent into a shared Elements example, so every intent renders the same set of
        elements the same way.
      </p>
      <ShowCase title="Intent matrix — every element, per intent" source={elementsSource}>
        <table className="list">
          <thead>
            <tr>
              {elementColumns.map(col => <th key={col.label} colSpan={col.colSpan} className="center">{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr key="default">
              <Elements />
            </tr>
            {intents.map(intent => (
              <tr key={intent}>
                <Elements intent={intent} />
              </tr>
            ))}
          </tbody>
        </table>
      </ShowCase>
    </>
  );
}
