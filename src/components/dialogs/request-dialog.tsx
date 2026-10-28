'use client';

import { ui } from '@/lib/ui';
import { useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

import { useWorkspace } from '@/providers/workspace-provider';

export function RequestDialog() {
  const { requestTarget, initialRequestFields, addRequest, setModal, notify } = useWorkspace();
  const [requestFields, setRequestFields] = useState(initialRequestFields),
    [requestNote, setRequestNote] = useState('');
  return (
    <>
      <h2 id="modal-title">Complete the picture.</h2>
      <p>
        Request missing information for <strong>{requestTarget}</strong>.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!requestFields.length) return;
          const request = {
            id: `REQ-${crypto.randomUUID().slice(0, 8)}`,
            target: requestTarget,
            fields: requestFields,
            note: requestNote,
            status: 'Pending',
            createdAt: new Date().toISOString(),
          };
          addRequest(request);
          setModal(null);
          notify(`${request.id} saved locally · No live enrichment is performed`);
        }}
      >
        <span className={ui('field-label')}>What information do you need?</span>
        <div className={ui('request-options')}>
          {['Work email', 'Phone number', 'LinkedIn profile', 'Company information'].map(
            (field) => (
              <label key={field}>
                <input
                  type="checkbox"
                  checked={requestFields.includes(field)}
                  onChange={() =>
                    setRequestFields((prev) =>
                      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
                    )
                  }
                />
                {field}
              </label>
            ),
          )}
        </div>
        <label className={ui('field-label')}>
          Additional context <span>(optional)</span>
          <textarea
            placeholder="Tell us what would help your outreach..."
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
            rows={3}
          />
        </label>
        <div className={ui('inline-info')}>
          <ShieldCheck size={16} /> Demo requests are saved to this browser. No information is sent
          to a research team.
        </div>
        <button className={ui('button primary wide')} disabled={!requestFields.length}>
          <Sparkles size={15} /> Save demo request
        </button>
      </form>
    </>
  );
}
