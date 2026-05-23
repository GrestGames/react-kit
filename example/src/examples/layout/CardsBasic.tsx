import { useState } from 'react';
import { Cards, Card, RkToast } from '@grest-ts/react';

const plans = [
  { id: 'starter', icon: '🌱', title: 'Starter', subtitle: 'For solo projects' },
  { id: 'team', icon: '🚀', title: 'Team', subtitle: 'Up to 10 seats' },
  { id: 'scale', icon: '🏢', title: 'Scale', subtitle: 'Unlimited seats' },
  {
    id: 'enterprise',
    icon: '🏰',
    title: 'Enterprise',
    subtitle: 'Custom contracts',
    features: ['SSO & SAML', 'Audit logs', 'Dedicated support', '99.9% SLA'],
  },
];

export default function CardsBasic() {
  const [selected, setSelected] = useState('team');

  return (
    <Cards minCardWidth={160}>
      {plans.map(p => (
        <Card key={p.id} selected={selected === p.id} onClick={() => setSelected(p.id)}>
          <div style={{ fontSize: 28 }}>{p.icon}</div>
          <div style={{ fontWeight: 700 }}>{p.title}</div>
          <div style={{ color: 'var(--rk-text-secondary)' }}>{p.subtitle}</div>
          {p.features?.map(f => (
            <div key={f} style={{ fontSize: 13, color: 'var(--rk-text-secondary)' }}>{f}</div>
          ))}
        </Card>
      ))}
      <Card variant="add" onClick={() => RkToast.info('Add a plan')}>
        <div style={{ fontSize: 28 }}>+</div>
        <div>New plan</div>
      </Card>
    </Cards>
  );
}
