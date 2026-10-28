'use client';

import { ui } from '@/lib/ui';
import { Plus, Bookmark, Mail } from 'lucide-react';
import type { Person } from '@/types/records';
import { useWorkspace } from '@/providers/workspace-provider';
import { PersonLink } from '@/components/records/record-display';

export function SaveButton({ recordId: key }: { recordId: string }) {
  const { saved, toggleSave } = useWorkspace();
  return (
    <button
      className={ui(`icon-button bookmark ${saved.includes(key) ? 'is-saved' : ''}`)}
      aria-label={saved.includes(key) ? 'Unsave record' : 'Save record'}
      title={saved.includes(key) ? 'Unsave' : 'Save'}
      onClick={() => toggleSave(key)}
    >
      <Bookmark size={16} fill={saved.includes(key) ? 'currentColor' : 'none'} />
    </button>
  );
}
export function ContactsTable({ records }: { records: Person[] }) {
  const { showContact, openRequest } = useWorkspace();
  return (
    <div className={ui('table-scroll')}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Job title</th>
            <th>Contact</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          {records.map((p) => (
            <tr key={p.id}>
              <td>{<PersonLink person={p} />}</td>
              <td>{p.role}</td>
              <td>
                <button
                  className={ui('contact-button')}
                  onClick={() => (p.email ? showContact(p) : openRequest(p.name))}
                >
                  {p.email ? <Mail size={14} /> : <Plus size={14} />}{' '}
                  {p.email ? 'View demo email' : 'Request email'}
                </button>
              </td>
              <td>{<SaveButton recordId={p.id} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
