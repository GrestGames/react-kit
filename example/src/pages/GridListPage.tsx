import { ReactNode, useState } from 'react';
import { SegmentedControl } from '@grest-ts/react';
import ShowCase from '../showcase/ShowCase';
import { AuditLogList, ImageBuildsList, McpServersList, OrgMembersList, SessionsList, UntaggedList, UsersList } from '../examples/form/GridList';
import source from '../examples/form/GridList.tsx?raw';

const WIDTHS = [{ id: '390', name: '390' }, { id: '600', name: '600' }, { id: '900', name: '900' }, { id: 'full', name: 'Full' }];

export default function GridListPage() {
  const [width, setWidth] = useState(new URLSearchParams(location.search).get('w') ?? 'full');
  const frame = (children: ReactNode) => <div style={{ maxWidth: width === 'full' ? undefined : +width, margin: '0 auto' }}>{children}</div>;
  return (
    <>
      <h1 className="pageTitle">Grid – list layout</h1>
      <p>A grid narrower than 600px renders as a list. Fields pick their place with <code>list</code>: title, subtitle, trailing, actions or hide; untagged fields become <code>label value</code> lines.</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span>Grid width</span>
        <SegmentedControl aria-label="Grid width" size="small" value={width} onChange={v => setWidth(String(v))} options={WIDTHS} />
      </div>
      <ShowCase title="Platform › Users — title, subtitle, row click, Add in the toolbar, folded filters" source={source}>{frame(<UsersList />)}</ShowCase>
      <ShowCase title="Org › Members — avatar title, Invite header action" source={source}>{frame(<OrgMembersList />)}</ShowCase>
      <ShowCase title="Audit log — trailing time, multi-line details, filters, 64 rows paged by 20" source={source}>{frame(<AuditLogList />)}</ShowCase>
      <ShowCase title="Image builds — status trailing, colSpan ignored in the list" source={source}>{frame(<ImageBuildsList />)}</ShowCase>
      <ShowCase title="AI sessions — numbers as detail lines, cost trailing" source={source}>{frame(<SessionsList />)}</ShowCase>
      <ShowCase title="MCP servers — row buttons, no row click" source={source}>{frame(<McpServersList />)}</ShowCase>
      <ShowCase title="No hints — label/value fallback" source={source}>{frame(<UntaggedList />)}</ShowCase>
    </>
  );
}
