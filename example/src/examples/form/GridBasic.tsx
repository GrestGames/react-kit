import { Grid, TextInput, Select, Button, RkToast } from '@grest-ts/react';
import type { GridField, GridQuery, FormObject } from '@grest-ts/react';

interface Row {
  id: number;
  name: string;
  email: string;
  role: string;
  score: number;
}

interface Filters {
  search?: string;
  role?: string | null;
}

const mockData: Row[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'dev', score: 92 },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'design', score: 87 },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'pm', score: 95 },
  { id: 4, name: 'Dave Brown', email: 'dave@example.com', role: 'dev', score: 78 },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'design', score: 91 },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'dev', score: 83 },
  { id: 7, name: 'Grace Wilson', email: 'grace@example.com', role: 'pm', score: 88 },
  { id: 8, name: 'Hank Taylor', email: 'hank@example.com', role: 'dev', score: 72 },
];

const roleOptions = [
  { id: null, name: 'All' },
  { id: 'dev', name: 'Developer' },
  { id: 'design', name: 'Designer' },
  { id: 'pm', name: 'Product Manager' },
];

const fields: GridField<Row>[] = [
  { title: '#', value: 'id', sortName: 'id', width: 40 },
  { title: 'Name', value: 'name', sortName: 'name' },
  { title: 'Email', value: 'email' },
  { title: 'Role', value: (row) => roleOptions.find(r => r.id === row.role)?.name ?? row.role, sortName: 'role' },
  { title: 'Score', value: 'score', sortName: 'score', sortDir: 'desc', align: 'right' },
  // Buttons inside <Grid> auto-render as outline (pass appearance="gradient" to opt one back out).
  { title: 'Actions', value: (row) => (
    <>
      <Button onClick={() => RkToast(`View ${row.name}`)}>View</Button>
      <Button intent="info" onClick={() => RkToast(`Edit ${row.name}`)}>Edit</Button>
      <Button intent="danger" confirmDouble confirmDoubleText={`Delete ${row.name}?`} onClick={() => RkToast.danger(`Delete ${row.name}`)}>Delete</Button>
    </>
  ), width: 200 },
];

export default function GridBasic() {
  return (
    <Grid<Row, Filters>
      fields={fields}
      defaultOrderBy={{ field: 'name', dir: 'asc' }}
      filtersUrlKeyName="demo-grid"
      load={async (query: Filters & GridQuery) => {
        await new Promise(r => setTimeout(r, 300));
        let rows = [...mockData];
        if (query.search) {
          const s = query.search.toLowerCase();
          rows = rows.filter(r => r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s));
        }
        if (query.role) {
          rows = rows.filter(r => r.role === query.role);
        }
        if (query.orderBy?.field) {
          const f = query.orderBy.field as keyof Row;
          const dir = query.orderBy.dir === 'desc' ? -1 : 1;
          rows.sort((a, b) => (a[f] > b[f] ? dir : a[f] < b[f] ? -dir : 0));
        }
        return { rows };
      }}
      filtersForm={(F: FormObject<Filters>) => (
        <div className="demoRow" style={{ alignItems: 'center' }}>
          <label style={{ flexDirection: 'row', alignItems: 'center' }}>Search: <TextInput prop={F.search} placeholder="Search..." /></label>
          <label style={{ flexDirection: 'row', alignItems: 'center' }}>Role: <Select prop={F.role} options={roleOptions} /></label>
          {/* Header buttons keep the default gradient appearance — only row buttons render as outline. */}
          <Button intent="default" onClick={() => F.getForm().submit()}>Search</Button>
          <Button onClick={() => { F.search.set(''); F.role.set(null); F.getForm().submit(); }}>Reset</Button>
        </div>
      )}
    />
  );
}
