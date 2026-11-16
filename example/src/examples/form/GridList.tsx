import { AddNewButton, Button, DateInput, Grid, SegmentedControl, Select, Tag, TextInput, RkToast } from '@grest-ts/react';
import type { FormObject, GridField, GridQuery, Intent } from '@grest-ts/react';

const wait = () => new Promise(r => setTimeout(r, 250));
const open = (what: string) => { RkToast.info(`Open ${what}`); };
const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const NOW = Date.now();
const ago = (at: number) => {
  const d = NOW - at;
  return d < HOUR ? `${Math.max(1, Math.round(d / MIN))}m ago` : d < DAY ? `${Math.round(d / HOUR)}h ago` : `${Math.round(d / DAY)}d ago`;
};

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'var(--rk-bg-active)', fontSize: 9, fontWeight: 600, color: 'var(--rk-text-secondary)', verticalAlign: 'middle' }}>{initials}</span>;
}

/* ── Platform › Users ─────────────────────────────────────── */

interface User { id: string; name: string; email: string; roles: string[]; deactivated?: boolean }

const USERS: User[] = [
  { id: 'u1', name: 'Oliver Leisalu', email: 'oliver@example.com', roles: [] },
  { id: 'u2', name: 'Admin Root', email: 'admin@kratt.local', roles: ['platformAdmin'] },
  { id: 'u3', name: 'Secondary User', email: 'secondary@example.com', roles: [] },
  { id: 'u4', name: 'New User', email: 'new@kratt.local', roles: [] },
  { id: 'u5', name: 'Maria Tamm', email: 'maria.tamm@a-very-long-company-domain.example', roles: ['platformSupport', 'platformBilling'] },
  { id: 'u6', name: 'Former Contractor', email: 'contractor@example.com', roles: [], deactivated: true },
  { id: 'u7', name: 'Jaan Kask', email: 'jaan@example.com', roles: [] },
  { id: 'u8', name: 'Liis Mets', email: 'liis@example.com', roles: ['platformSupport'] },
  { id: 'u9', name: 'Priit Saar', email: 'priit@example.com', roles: [] },
  { id: 'u10', name: 'Kadri Lepp', email: 'kadri@example.com', roles: [] },
];

interface UserFilters { search: string; show: string }

export function UsersList() {
  return <Grid<User, UserFilters>
    filtersUrlKeyName="users"
    defaultFilters={{ search: '', show: 'all' }}
    onRowClick={u => open(u.name)}
    load={async (q: Partial<UserFilters> & GridQuery) => {
      await wait();
      const s = q.search?.trim().toLowerCase();
      return { rows: USERS.filter(u => (!s || u.email === s || u.id === s) && (q.show !== 'roleHolders' || u.roles.length > 0)) };
    }}
    searchForm={(F: FormObject<UserFilters>) => <>
      <TextInput prop={F.search} placeholder="Exact email or user ID" />
      <Button onClick={() => F.getForm().submit()}>Find</Button>
    </>}
    filtersForm={(F: FormObject<UserFilters>) =>
      <Select prop={F.show} onChange={() => F.getForm().submit()} options={[{ id: 'all', name: 'All users' }, { id: 'roleHolders', name: 'Platform role holders' }]} />}
    fields={[
      { title: 'No', list: 'hide', style: { textAlign: 'center' }, width: 40, value: (r, no) => no + 1 },
      { title: 'Name', list: 'title', value: u => <><a onClick={() => open(u.name)}>{u.name}</a>{u.deactivated && <> <Tag intent="neutral">Deactivated</Tag></>}</> },
      { title: 'Email', list: 'subtitle', value: u => u.email },
      { title: 'Platform roles', value: u => u.roles.join(', ') },
      { title: <AddNewButton onClick={() => open('new user')} />, list: 'hide', width: 60, value: u => <Button onClick={() => open(u.name)}>View</Button> },
    ]}
  />;
}

/* ── Org › Members ────────────────────────────────────────── */

interface Member { id: string; name: string; orgEmail?: string }

const MEMBERS: Member[] = [
  { id: 'm1', name: 'Admin Root', orgEmail: 'admin@default.example' },
  { id: 'm2', name: 'Oliver Leisalu', orgEmail: 'oliver@default.example' },
  { id: 'm3', name: 'Maria Tamm' },
  { id: 'm4', name: 'Jaan Kask', orgEmail: 'jaan@default.example' },
];

export function OrgMembersList() {
  return <Grid<Member, object>
    filtersUrlKeyName="members"
    onRowClick={m => open(m.name)}
    load={async () => { await wait(); return { rows: MEMBERS }; }}
    fields={[
      { title: 'No', list: 'hide', align: 'center', width: 40, value: (r, no) => no + 1 },
      { title: 'Name', list: 'title', value: m => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={m.name} /><a onClick={() => open(m.name)}>{m.name}</a></span> },
      { title: 'Org email', list: 'subtitle', value: m => m.orgEmail ?? '' },
      { title: <AddNewButton onClick={() => open('invite')}>Invite</AddNewButton>, list: 'hide', width: 60, value: m => <Button onClick={() => open(m.name)}>View</Button> },
    ]}
  />;
}

/* ── Workspace › Audit log ────────────────────────────────── */

interface AuditRow { id: string; at: number; category: string; action: string; outcome?: string; actor: string; ip?: string; resource: string; workspace?: string; details: { label: string; value: string }[] }

const CATEGORIES: { id: string; name: string; intent: Intent }[] = [
  { id: 'access', name: 'Access', intent: 'warning' },
  { id: 'authz', name: 'Permissions', intent: 'info' },
  { id: 'data', name: 'Data', intent: 'neutral' },
  { id: 'exposure', name: 'Exposure', intent: 'danger' },
  { id: 'lifecycle', name: 'Lifecycle', intent: 'neutral' },
];
const ACTIONS: Record<string, string[]> = {
  access: ['workspace.access', 'terminal.open'],
  authz: ['role.grant', 'role.revoke'],
  data: ['secret.read', 'file.download'],
  exposure: ['service.makePublic'],
  lifecycle: ['workspace.start', 'workspace.stop', 'workspace.archive'],
};
const ACTORS = ['Admin Root', 'Oliver Leisalu', 'VM ben7vxdoahxo3lfb (Admin Root)', 'System', 'Deploy key dk-41'];

const AUDIT: AuditRow[] = Array.from({ length: 64 }, (_, i) => {
  const category = CATEGORIES[(i * 7) % CATEGORIES.length].id;
  const action = ACTIONS[category][i % ACTIONS[category].length];
  const actor = ACTORS[i % ACTORS.length];
  return {
    id: 'e' + i, at: NOW - i * 47 * MIN - 19_000, category, action, actor,
    outcome: i % 11 === 3 ? 'failed: permission denied' : i % 13 === 5 ? 'started' : undefined,
    ip: actor === 'System' ? undefined : '127.0.0.1',
    resource: category === 'authz' ? 'user Oliver Leisalu' : 'workspace ben7vxdoahxo3lfb',
    workspace: i % 4 === 0 ? 'ben7vxdoahxo3lfb' : undefined,
    details: category === 'authz' ? [{ label: 'Role', value: 'maintainer' }, { label: 'Scope', value: 'project kratt' }]
      : category === 'access' ? [{ label: 'Surface', value: 'relay-api' }] : [],
  };
});

interface AuditFilters { category: string; actor: string; from: string; to: string }

export function AuditLogList() {
  return <Grid<AuditRow, AuditFilters>
    filtersUrlKeyName="audit"
    rowsPerCall={20}
    defaultFilters={{ category: 'all', actor: 'all', from: '', to: '' }}
    load={async (q: Partial<AuditFilters> & GridQuery) => {
      await wait();
      const rows = AUDIT.filter(e => (!q.category || q.category === 'all' || e.category === q.category)
        && (!q.actor || q.actor === 'all' || (q.actor === 'system' ? e.actor === 'System' : e.actor !== 'System')));
      const start = Number(q.cursor ?? 0), end = start + (q.limit?.[1] ?? 20);
      return { rows: rows.slice(start, end), nextCursor: end < rows.length ? String(end) : undefined };
    }}
    filtersForm={(F: FormObject<AuditFilters>) => {
      const apply = () => F.getForm().submit();
      return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <SegmentedControl aria-label="Category" size="small" prop={F.category} onChange={apply} options={[{ id: 'all', name: 'All' }, ...CATEGORIES]} />
        <SegmentedControl aria-label="Actor" size="small" prop={F.actor} onChange={apply} options={[{ id: 'all', name: 'All' }, { id: 'user', name: 'User' }, { id: 'system', name: 'System' }]} />
        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span className="gray">From</span> <DateInput prop={F.from} onChange={apply} />
          <span className="gray">to</span> <DateInput prop={F.to} onChange={apply} />
        </span>
      </div>;
    }}
    fields={[
      { title: 'Time', list: 'trailing', value: e => <span title={new Date(e.at).toLocaleString()}>{ago(e.at)}</span> },
      { title: 'Action', list: 'title', value: e => {
        const c = CATEGORIES.find(c => c.id === e.category);
        return <><Tag intent={c?.intent} title={c?.name}>{e.action}</Tag>{e.outcome && <> <Tag intent={e.outcome.startsWith('failed') ? 'danger' : 'neutral'}>{e.outcome}</Tag></>}</>;
      } },
      { title: 'Actor', list: 'subtitle', truncate: 160, value: e => e.actor },
      { title: 'From', truncate: 140, value: e => e.ip ?? '' },
      { title: 'Resource', list: 'subtitle', truncate: 160, value: e => e.resource },
      { title: 'Workspace', truncate: 120, value: e => e.workspace ?? '' },
      { title: 'Details', wrap: 'words', value: e => e.details.map((d, i) => <div key={i}><span className="gray">{d.label}:</span> {d.value}</div>) },
    ]}
  />;
}

/* ── Cloud › Image builds ─────────────────────────────────── */

interface Build { id: string; startedAt: number; image: string; trigger: 'schedule' | 'hand'; status: 'Queued' | 'Building' | 'Built' | 'Failed'; step?: string; result?: 'current' | string; tookMs?: number; sizeMb?: number }

const STATUS_INTENT: Record<Build['status'], 'info' | 'success' | 'danger'> = { Queued: 'info', Building: 'info', Built: 'success', Failed: 'danger' };
const BUILDS: Build[] = [
  { id: 'b1', startedAt: NOW - 4 * MIN, image: 'kratt', trigger: 'hand', status: 'Building', step: 'Step 3/7 · npm ci' },
  { id: 'b2', startedAt: NOW - 3 * HOUR, image: 'kratt', trigger: 'schedule', status: 'Built', result: 'current', tookMs: 9 * MIN + 12_000, sizeMb: 6420 },
  { id: 'b3', startedAt: NOW - DAY, image: 'Base image', trigger: 'schedule', status: 'Failed', result: 'Error', tookMs: 2 * MIN },
  { id: 'b4', startedAt: NOW - 2 * DAY, image: 'react-kit', trigger: 'hand', status: 'Built', result: 'img-8f3a2c', tookMs: 4 * MIN + 40_000, sizeMb: 3100 },
  { id: 'b5', startedAt: NOW - 3 * DAY, image: 'grest-ts', trigger: 'schedule', status: 'Built', result: 'img-77d0e1', tookMs: 5 * MIN, sizeMb: 2980 },
];
const fmtDuration = (ms: number) => `${Math.floor(ms / MIN)}m ${Math.round((ms % MIN) / 1000)}s`;
const fmtStarted = (at: number) => new Date(at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

export function ImageBuildsList() {
  const fields: GridField<Build>[] = [
    { title: 'Started', list: 'subtitle', width: 120, value: b => fmtStarted(b.startedAt) },
    { title: 'Image', list: 'title', truncate: 220, value: b => b.image },
    { title: 'Trigger', list: 'hide', width: 80, value: b => <Tag intent={b.trigger === 'schedule' ? 'info' : 'neutral'}>{b.trigger === 'schedule' ? 'Scheduled' : 'By hand'}</Tag> },
    { title: 'Status', list: 'trailing', width: 70, value: b => <Tag intent={STATUS_INTENT[b.status]}>{b.status}</Tag> },
    { title: 'Result', colSpan: b => b.status === 'Building' ? 2 : 1, value: b => b.step ? <span className="gray">{b.step}</span>
        : b.result === 'current' ? <Tag intent="success">In use</Tag> : b.result === 'Error' ? <Tag intent="danger">Error</Tag> : b.result ? <span className="gray">Image {b.result}</span> : null },
    { title: 'Took', list: 'subtitle', width: 60, align: 'right', value: b => b.tookMs ? fmtDuration(b.tookMs) : '' },
    { title: 'Size', list: 'subtitle', width: 70, align: 'right', value: b => b.sizeMb ? (b.sizeMb / 1024).toFixed(1) + ' GB' : '' },
    { title: '', list: 'hide', width: 60, value: b => <Button size="small" onClick={() => open(b.id)}>View</Button> },
  ];
  return <Grid<Build, object> filtersUrlKeyName="builds" onRowClick={b => open(b.id)} load={async () => { await wait(); return { rows: BUILDS }; }} fields={fields} />;
}

/* ── Stats › AI sessions ──────────────────────────────────── */

interface Session { id: string; provider: string; label: string; workspace: string; person: string; at: number; input: number; output: number; cWrite: number; cRead: number; cost: number }

const SESSIONS: Session[] = [
  { id: 's1', provider: 'claude', label: 'Grid list layout for mobile', workspace: 'mobile-grids', person: 'Oliver Leisalu', at: NOW - 3 * MIN, input: 1_240_000, output: 84_000, cWrite: 310_000, cRead: 9_800_000, cost: 18.42 },
  { id: 's2', provider: 'codex', label: 'Fix flaky socket reconnect test', workspace: 'socket-fix', person: 'Maria Tamm', at: NOW - 2 * HOUR, input: 220_000, output: 12_000, cWrite: 0, cRead: 1_100_000, cost: 2.1 },
  { id: 's3', provider: 'claude', label: '(4f0c19ab…)', workspace: 'billing', person: 'Jaan Kask', at: NOW - 5 * HOUR, input: 3_000, output: 400, cWrite: 0, cRead: 0, cost: 0 },
  { id: 's4', provider: 'gemini', label: 'Audit log date filters and paging across the whole org with a long title', workspace: 'audit', person: 'Liis Mets', at: NOW - DAY, input: 640_000, output: 31_000, cWrite: 90_000, cRead: 2_400_000, cost: 5.77 },
];
const tok = (n: number) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(n);
const num = (n: number, color: string) => <span style={{ color, fontFamily: 'var(--rk-font-mono)', fontVariantNumeric: 'tabular-nums' }}>{tok(n)}</span>;

export function SessionsList() {
  return <div style={{ fontSize: 'var(--rk-font-size-small)' }}>
    <Grid<Session, object> filtersUrlKeyName="sessions" onRowClick={s => open(s.label)} load={async () => { await wait(); return { rows: SESSIONS }; }}
      fields={[
        { width: 24, list: 'hide', value: s => <span title={s.provider}>◆</span> },
        { title: 'Session', list: 'title', truncate: 420, value: s => s.label },
        { title: 'Workspace', list: 'subtitle', value: s => s.workspace },
        { title: 'Person', list: 'subtitle', truncate: 160, value: s => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Avatar name={s.person} />{s.person}</span> },
        { title: 'Last change', list: 'trailing', align: 'right', value: s => <span className="gray">{ago(s.at)}</span> },
        { title: 'Input', align: 'right', value: s => num(s.input, 'var(--rk-accent)') },
        { title: 'Output', align: 'right', value: s => num(s.output, 'var(--rk-success)') },
        { title: 'C·write', list: 'hide', align: 'right', value: s => num(s.cWrite, 'var(--rk-warning)') },
        { title: 'C·read', list: 'hide', align: 'right', value: s => num(s.cRead, 'var(--rk-text-muted)') },
        { title: 'Cost', list: 'trailing', align: 'right', value: s => <b style={{ color: s.cost > 0 ? 'var(--rk-purple)' : 'var(--rk-border-strong)' }}>{s.cost > 0 ? '$' + s.cost.toFixed(2) : '—'}</b> },
      ]} />
  </div>;
}

/* ── MCP servers (row buttons, no row click) ──────────────── */

interface McpServer { id: string; name: string; url: string; use: string; client: string }

const MCP: McpServer[] = [
  { id: 'x1', name: 'Linear', url: 'https://mcp.linear.app/sse', use: 'Everyone', client: 'Registered by kratt' },
  { id: 'x2', name: 'Sentry', url: 'https://mcp.sentry.dev/mcp/organizations/grestgames/projects/kratt-hub', use: 'Opt-in', client: "Org's own" },
  { id: 'x3', name: 'Internal docs', url: 'https://docs.internal.example/mcp', use: 'Everyone', client: '' },
];

export function McpServersList() {
  return <Grid<McpServer, object> filtersUrlKeyName="mcp" load={async () => { await wait(); return { rows: MCP }; }}
    fields={[
      { title: 'Name', list: 'title', value: r => <b>{r.name}</b> },
      { title: 'URL', list: 'subtitle', style: { width: '100%', maxWidth: 0 }, value: r => <div title={r.url} style={{ fontFamily: 'var(--rk-font-mono)', fontSize: 'var(--rk-font-size-small)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.url}</div> },
      { title: 'Use', value: r => r.use },
      { title: 'Client', value: r => r.client },
      { title: '', list: 'actions', width: 70, align: 'right', value: r => <Button size="small" appearance="outline" onClick={() => open('edit ' + r.name)}>Edit</Button> },
    ]} />;
}

/* ── No hints: the label/value fallback ───────────────────── */

interface Plain { id: number; name: string; email: string; role: string; score: number }

const PLAIN: Plain[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Developer', score: 92 },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', score: 87 },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Product Manager', score: 95 },
];

export function UntaggedList() {
  return <Grid<Plain, object> filtersUrlKeyName="plain" defaultOrderBy={{ field: 'name', dir: 'asc' }}
    load={async q => {
      await wait();
      const f = (q.orderBy?.field ?? 'name') as keyof Plain, dir = q.orderBy?.dir === 'desc' ? -1 : 1;
      return { rows: [...PLAIN].sort((a, b) => a[f] > b[f] ? dir : -dir) };
    }}
    fields={[
      { title: '#', value: 'id', sortName: 'id', width: 40 },
      { title: 'Name', value: 'name', sortName: 'name' },
      { title: 'Email', value: 'email' },
      { title: 'Role', value: 'role', sortName: 'role' },
      { title: 'Score', value: 'score', sortName: 'score', sortDir: 'desc', align: 'right' },
      { title: '', list: 'actions', value: r => <Button onClick={() => open(r.name)}>View</Button> },
    ]} />;
}
