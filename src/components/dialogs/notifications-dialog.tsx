'use client';

import { ui } from '@/lib/ui';
import { useRouter } from 'next/navigation';
import { ArrowRight, Layers } from 'lucide-react';
import { useWorkspace } from '@/providers/workspace-provider';

export function NotificationsDialog() {
  const { setModal } = useWorkspace();
  const router = useRouter();
  return (
    <>
      <h2 id="modal-title">You’re all caught up.</h2>
      <p>Your workspace updates will appear here.</p>
      <div className={ui('notification-item')}>
        <span className={ui('stat-icon blue')}>
          <Layers size={20} />
        </span>
        <div>
          <strong>Welcome to your Infoxem workspace</strong>
          <p>Explore buyers, save contacts, and build your first list.</p>
          <small>Demo workspace · Getting started</small>
        </div>
      </div>
      <button
        className={ui('button primary wide')}
        onClick={() => {
          setModal(null);
          router.push('/buyers');
        }}
      >
        Explore buyers <ArrowRight size={15} />
      </button>
    </>
  );
}
