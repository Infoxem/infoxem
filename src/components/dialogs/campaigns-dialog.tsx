'use client';

import { ui } from '@/lib/ui';
import { useRouter } from 'next/navigation';
import { ArrowRight, Send } from 'lucide-react';
import { useWorkspace } from '@/providers/workspace-provider';
import { Badge } from '@/components/records/record-display';

export function CampaignsDialog() {
  const { setModal } = useWorkspace();
  const router = useRouter();
  return (
    <>
      <Badge tone="blue">Coming next</Badge>
      <h2 id="modal-title">From connection to conversation.</h2>
      <p>
        The future campaign workspace will bring your buyer lists and personalized outreach
        together.
      </p>
      <div className={ui('campaign-preview')}>
        <Send size={28} />
        <h3>Your next campaign starts with a great list.</h3>
        <p>Build a shortlist now so you’re ready when outreach is connected.</p>
      </div>
      <button
        className={ui('button primary wide')}
        onClick={() => {
          setModal(null);
          router.push('/buyers');
        }}
      >
        Start discovering buyers <ArrowRight size={15} />
      </button>
    </>
  );
}
