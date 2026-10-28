'use client';

import { ui } from '@/lib/ui';
import { CheckCircle2, X } from 'lucide-react';
import { useWorkspace } from '@/providers/workspace-provider';

export function Toast() {
  const { toast, notify } = useWorkspace();
  return toast ? (
    <div className={ui('toast')} role="status">
      <CheckCircle2 size={18} />
      {toast}
      <button aria-label="Dismiss notification" onClick={() => notify('')}>
        <X size={15} />
      </button>
    </div>
  ) : null;
}
