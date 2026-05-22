const intents = ['neutral', 'info', 'cool', 'success', 'warning', 'danger', 'critical'] as const;

export default function ButtonIntents() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {intents.map(intent => (
        <button key={intent} style={{ background: `var(--rk-${intent}-fill)`, color: 'var(--rk-text-on-accent)' }}>
          {intent}
        </button>
      ))}
    </div>
  );
}
