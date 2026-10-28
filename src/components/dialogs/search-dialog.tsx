'use client';

import { ui } from '@/lib/ui';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { companies, people } from '@/lib/demo-data';
import { useWorkspace } from '@/providers/workspace-provider';
import { companyLinkContent } from '@/components/records/record-display';

export function SearchDialog() {
  const { setModal } = useWorkspace();
  const [globalQuery, setGlobalQuery] = useState('');
  return (
    <>
      <h2 id="modal-title">Your next connection starts here.</h2>
      <label className={ui('modal-search')}>
        <Search size={18} />
        <input
          autoFocus
          placeholder="Search companies, people, or markets..."
          value={globalQuery}
          onChange={(e) => setGlobalQuery(e.target.value)}
        />
      </label>
      <div className={ui('global-results')}>
        {companies
          .filter((c) =>
            (c.name + ' ' + c.country + ' ' + c.products.join(' '))
              .toLowerCase()
              .includes(globalQuery.toLowerCase()),
          )
          .slice(0, 4)
          .map((c) => (
            <Link href={`/buyers/${c.id}`} key={c.id} onClick={() => setModal(null)}>
              {companyLinkContent(c)}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        {people
          .filter((p) => (p.name + ' ' + p.role).toLowerCase().includes(globalQuery.toLowerCase()))
          .slice(0, 3)
          .map((p) => (
            <Link href={`/people/${p.id}`} key={p.id} onClick={() => setModal(null)}>
              <span className={ui('identity')}>
                <span className={ui('person-avatar blue')}>{p.initials}</span>
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.role}</small>
                </span>
              </span>
              <ArrowUpRight size={16} />
            </Link>
          ))}
        {globalQuery &&
          !companies.some((c) =>
            (c.name + ' ' + c.country + ' ' + c.products.join(' '))
              .toLowerCase()
              .includes(globalQuery.toLowerCase()),
          ) &&
          !people.some((p) =>
            (p.name + ' ' + p.role).toLowerCase().includes(globalQuery.toLowerCase()),
          ) && <p className={ui('muted')}>No matches. Try a company name, market, or role.</p>}
      </div>
    </>
  );
}
