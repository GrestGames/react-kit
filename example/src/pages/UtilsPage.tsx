import UtilsOverview from '../examples/utils/UtilsOverview';

export default function UtilsPage() {
  return (
    <>
      <h1 className="pageTitle">Utilities & Hooks Reference</h1>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
        These are non-visual utilities, hooks, and helpers exported by <code>@grest-ts/react</code>.
        They don't have live demos but are documented here for reference.
      </p>
      <UtilsOverview />
    </>
  );
}
