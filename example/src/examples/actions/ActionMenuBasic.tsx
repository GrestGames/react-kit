import { ActionMenu, RkToast } from '@grest-ts/react';

export default function ActionMenuBasic() {
  return (
    <div className="demoRow">
      <ActionMenu items={[
        { label: 'Actions', info: true },
        { label: 'Edit', onClick: () => RkToast.info('Edit clicked') },
        { label: 'Duplicate', onClick: () => RkToast.success('Duplicated') },
        { label: 'Sync (async)', keepOpen: true, onClick: async () => { await new Promise(r => setTimeout(r, 1200)); RkToast.success('Synced'); } },
        { separator: true },
        { label: 'Archive', warning: true, onClick: () => RkToast.warning('Archived') },
        { label: 'Delete', danger: true, onClick: () => RkToast.danger('Deleted') },
      ]} />
      <ActionMenu trigger="⚙" triggerColor="#7c5cbf" tooltip="Settings" align="center" position="above" items={[
        { label: 'Custom trigger, opens above, centered', info: true },
        { label: 'Preferences', onClick: () => RkToast('Preferences') },
        { label: 'Sign out', danger: true, onClick: () => RkToast.danger('Signed out') },
      ]} />
    </div>
  );
}
