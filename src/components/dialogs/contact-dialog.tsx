'use client';

import { ui } from '@/lib/ui';
import Link from 'next/link';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { byId } from '@/lib/demo-data';
import { useWorkspace } from '@/providers/workspace-provider';

export function ContactDialog() {
  const { contactPerson: person, setModal } = useWorkspace();
  if (!person) return null;
  return (
    <>
      <h2 id="modal-title">A starting point for your next conversation.</h2>
      <p>
        Illustrative contact information for <strong>{person.name}</strong>.
      </p>
      <div className={ui('contact-preview')}>
        <Mail size={20} />
        <div>
          <small>Sample work email</small>
          <a
            href={`mailto:${person.name.toLowerCase().split(' ')[0]}@${byId(person.company).domain}`}
          >
            {person.name.toLowerCase().split(' ')[0]}@{byId(person.company).domain}
          </a>
        </div>
      </div>
      <div className={ui('inline-info')}>
        <ShieldCheck size={16} /> This address uses a reserved .example domain. It is not a verified
        contact.
      </div>
      <Link
        className={ui('button primary wide')}
        href={`/people/${person.id}`}
        onClick={() => setModal(null)}
      >
        View person profile <ArrowRight size={15} />
      </Link>
    </>
  );
}
