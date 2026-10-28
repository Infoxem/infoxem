'use client';

import { ui } from '@/lib/ui';
import { ShieldCheck } from 'lucide-react';
import { useWorkspace } from '@/providers/workspace-provider';
import { Badge, Fact } from '@/components/records/record-display';

export function SettingsDialog() {
  const { saved, lists } = useWorkspace();
  return (
    <>
      <h2 id="modal-title">Your workspace</h2>
      <p>A focused place for your export business.</p>
      <div className={ui('settings-profile')}>
        <span className={ui('user-avatar')}>KP</span>
        <div>
          <strong>Kartavya Patel</strong>
          <small>Apex Pharma · Workspace owner</small>
        </div>
        <Badge tone="blue">Demo</Badge>
      </div>
      <dl className={ui('settings-facts')}>
        <Fact label="Workspace" value="Apex Pharma" />
        <Fact label="Industry" value="Pharmaceutical exports" />
        <Fact label="Saved records" value={saved.length} />
        <Fact label="Your lists" value={lists.length} />
        <Fact label="Interface" value="Light · Inter · Cobalt blue" />
      </dl>
      <div className={ui('inline-info')}>
        <ShieldCheck size={16} /> This UI prototype stores lists, bookmarks, notes, and requests in
        your browser. Account services are not connected.
      </div>
    </>
  );
}
