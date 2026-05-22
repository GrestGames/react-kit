import { ActionMenu, toast } from '@grest-ts/react';

export default function ActionMenuBasic() {
  return (
    <div className="demoRow">
      <ActionMenu items={[
        { label: 'Actions', info: true },
        { label: 'Edit', onClick: () => toast.info('Edit clicked') },
        { label: 'Duplicate', onClick: () => toast.success('Duplicated') },
        { label: 'Sync (async)', keepOpen: true, onClick: async () => { await new Promise(r => setTimeout(r, 1200)); toast.success('Synced'); } },
        { separator: true },
        { label: 'Archive', warning: true, onClick: () => toast.warning('Archived') },
        { label: 'Delete', danger: true, onClick: () => toast.danger('Deleted') },
      ]} />
      <ActionMenu trigger="⚙" triggerColor="#7c5cbf" title="Settings" align="center" position="above" items={[
        { label: 'Custom trigger, opens above, centered', info: true },
        { label: 'Preferences', onClick: () => toast('Preferences') },
        { label: 'Sign out', danger: true, onClick: () => toast.danger('Signed out') },
      ]} />
    </div>
  );
}
