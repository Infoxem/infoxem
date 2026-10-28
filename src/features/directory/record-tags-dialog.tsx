'use client';

import { ui } from '@/lib/ui';
import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Logo } from '@/components/records/record-display';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import type { Company } from '@/types/records';

export type RecordTags = { company: Company; kind: 'Industries' | 'Keywords'; values: string[] };

export function RecordTagsDialog({ detail, onClose }: { detail: RecordTags; onClose: () => void }) {
  const close = useCallback(() => onClose(), [onClose]);
  const ref = useDialogFocus(true, close);
  return createPortal(
    <div className={ui('record-modal-backdrop')} onClick={close}>
      <section
        ref={ref}
        className={ui('record-tags-modal')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-tags-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <Logo company={detail.company} />
          <h2 id="record-tags-title" title={`${detail.kind} for ${detail.company.name}`}>
            {detail.kind} for {detail.company.name}
          </h2>
          <button className={ui('icon-button')} aria-label="Close dialog" onClick={close}>
            <X size={18} />
          </button>
        </header>
        <div className={ui('record-modal-tags')}>
          {detail.values.map((value) => (
            <span className={ui('record-pill')} key={value}>
              {value}
            </span>
          ))}
        </div>
        <footer>
          <button className={ui('button primary')} onClick={close}>
            Close
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
