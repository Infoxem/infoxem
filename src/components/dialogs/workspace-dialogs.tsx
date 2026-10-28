'use client';

import { ui } from '@/lib/ui';
import { useCallback } from 'react';
import { Search, Sparkles, Bell, Settings, HelpCircle, Send, Layers, X } from 'lucide-react';
import { useWorkspace } from '@/providers/workspace-provider';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import { ContactDialog } from './contact-dialog';
import { SearchDialog } from './search-dialog';
import { ListDialog } from './list-dialog';
import { RequestDialog } from './request-dialog';
import { NotificationsDialog } from './notifications-dialog';
import { SettingsDialog } from './settings-dialog';
import { HelpDialog } from './help-dialog';
import { CampaignsDialog } from './campaigns-dialog';

const dialogs = {
  contact: ContactDialog,
  search: SearchDialog,
  list: ListDialog,
  request: RequestDialog,
  notifications: NotificationsDialog,
  settings: SettingsDialog,
  help: HelpDialog,
  campaigns: CampaignsDialog,
};
const icons = {
  contact: Layers,
  search: Search,
  list: Layers,
  request: Sparkles,
  notifications: Bell,
  settings: Settings,
  help: HelpCircle,
  campaigns: Send,
};

export function WorkspaceDialogs() {
  const { modal, setModal } = useWorkspace();
  const close = useCallback(() => setModal(null), [setModal]);
  const ref = useDialogFocus(!!modal, close);
  if (!modal) return null;
  const Content = dialogs[modal],
    Icon = icons[modal];
  return (
    <div className={ui('modal-backdrop')} onClick={close}>
      <section
        ref={ref}
        className={ui(`modal ${modal === 'search' ? 'search-modal' : ''}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={ui('modal-heading')}>
          <span className={ui('modal-icon')}>
            <Icon size={21} />
          </span>
          <button className={ui('icon-button')} aria-label="Close dialog" onClick={close}>
            <X size={19} />
          </button>
        </div>
        <Content key={modal} />
      </section>
    </div>
  );
}
