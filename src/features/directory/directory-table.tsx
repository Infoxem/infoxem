'use client';

import { ui } from '@/lib/ui';
import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import {
  Search,
  Mail,
  Phone,
  Globe,
  Bookmark,
  Check,
  ChevronDown,
  ArrowUpRight,
  CircleHelp,
  CircleCheck,
  ChevronsUpDown,
} from 'lucide-react';
import { byId } from '@/lib/demo-data';
import type { Company, Person } from '@/types/records';
import { useWorkspace } from '@/providers/workspace-provider';
import { Logo } from '@/components/records/record-display';
import { RecordTooltip } from './record-tooltip';
import { RecordTagsDialog, type RecordTags } from './record-tags-dialog';

export function DirectoryTable({
  isPeople,
  records,
  selected,
  setSelected,
  hasSearch,
  reset,
}: {
  isPeople: boolean;
  records: (Company | Person)[];
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
  hasSearch: boolean;
  reset: () => void;
}) {
  const { showContact, openRequest, saved, toggleSave } = useWorkspace();
  const [detail, setDetail] = useState<RecordTags | null>(null);
  const closeDetail = useCallback(() => setDetail(null), []);
  const columns = isPeople
    ? ['Name', 'Job title', 'Company', 'Emails', 'Phone numbers', 'Actions']
    : ['Name', 'Actions', 'Links', 'Number of employees', 'Industries', 'Keywords', 'Location'];
  const toggleRow = (id: string) =>
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    );
  const save = (record: Company | Person) => (
    <button
      className={ui(`record-save ${saved.includes(record.id) ? 'saved' : ''}`)}
      aria-label={`${saved.includes(record.id) ? 'Unsave' : 'Save'} ${record.name}`}
      aria-pressed={saved.includes(record.id)}
      onClick={() => toggleSave(record.id)}
    >
      {saved.includes(record.id) ? <Check size={14} /> : <Bookmark size={14} />}
      {saved.includes(record.id) ? 'Saved' : 'Save'}
    </button>
  );
  return (
    <>
      <div
        className={ui(
          `table-scroll directory-table record-grid ${isPeople ? 'people-grid' : 'buyer-grid'}`,
        )}
        role="region"
        aria-label={isPeople ? 'People records' : 'Buyer records'}
        tabIndex={0}
      >
        <table>
          <colgroup>
            <col className={ui('record-check-col')} />
            {columns.map((column, index) => (
              <col key={column} className={ui(`record-col-${index}`)} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className={ui('record-checkbox')}>
                <input
                  type="checkbox"
                  aria-label="Select all visible records"
                  disabled={!records.length}
                  checked={
                    !!records.length && records.every((record) => selected.includes(record.id))
                  }
                  onChange={(event) =>
                    setSelected((previous) =>
                      event.target.checked
                        ? [...new Set([...previous, ...records.map((record) => record.id)])]
                        : previous.filter((id) => !records.some((record) => record.id === id)),
                    )
                  }
                />
              </th>
              {columns.map((column) => (
                <th scope="col" key={column}>
                  <span className={ui('record-column-label')}>
                    {column}
                    <ChevronsUpDown size={11} aria-hidden="true" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const person = 'role' in record ? record : null;
              const company = 'company' in record ? byId(record.company) : record;
              const keywords = [...company.products, company.type];
              return (
                <tr
                  key={record.id}
                  className={ui(selected.includes(record.id) ? 'record-selected' : '')}
                >
                  <td className={ui('record-checkbox')}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${record.name}`}
                      checked={selected.includes(record.id)}
                      onChange={() => toggleRow(record.id)}
                    />
                  </td>
                  <td className={ui('record-name-cell')}>
                    <RecordTooltip text={`Open ${record.name}`}>
                      <Link
                        className={ui('record-name')}
                        href={person ? `/people/${person.id}` : `/buyers/${company.id}`}
                      >
                        {!person && <Logo company={company} />}
                        <span>{record.name}</span>
                      </Link>
                    </RecordTooltip>
                  </td>
                  {person ? (
                    <>
                      <td>
                        <span className={ui('record-truncate')} tabIndex={0}>
                          {person.role}
                        </span>
                      </td>
                      <td>
                        <Link className={ui('record-employer')} href={`/buyers/${company.id}`}>
                          <Logo company={company} />
                          <span>{company.name}</span>
                        </Link>
                      </td>
                      <td>
                        <RecordTooltip
                          text={
                            person.email
                              ? 'View illustrative work email'
                              : 'Request missing work email'
                          }
                        >
                          <button
                            className={ui('record-contact')}
                            onClick={() =>
                              person.email
                                ? showContact(person)
                                : openRequest(person.name, ['Work email'])
                            }
                          >
                            <span className={ui('record-contact-icon')}>
                              <Mail size={15} />
                              {person.email ? (
                                <CircleCheck className={ui('contact-status available')} size={9} />
                              ) : (
                                <CircleHelp className={ui('contact-status')} size={9} />
                              )}
                            </span>
                            {person.email ? 'Access email' : 'Request email'}
                          </button>
                        </RecordTooltip>
                      </td>
                      <td>
                        <RecordTooltip text="Request missing phone number">
                          <button
                            className={ui('record-contact')}
                            onClick={() => openRequest(person.name, ['Phone number'])}
                          >
                            <Phone size={15} /> Request phone
                          </button>
                        </RecordTooltip>
                      </td>
                      <td>
                        <div className={ui('record-actions')}>
                          {save(person)}

                          <Link
                            className={ui('record-icon-link')}
                            aria-label={`Open ${person.name}'s profile`}
                            href={`/people/${person.id}`}
                          >
                            <ArrowUpRight size={16} />
                          </Link>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{save(company)}</td>
                      <td>
                        <div className={ui('record-links')}>
                          <RecordTooltip text={`Website · ${company.domain}`}>
                            <a
                              className={ui('record-icon-link')}
                              aria-label={`Visit ${company.name} website`}
                              href={`https://${company.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Globe size={16} />
                            </a>
                          </RecordTooltip>
                        </div>
                      </td>
                      <td>
                        <span className={ui('record-employee-count')}>{company.size}</span>
                      </td>
                      <td>
                        <button
                          className={ui('record-tag-button')}
                          aria-label={`View industries for ${company.name}`}
                          aria-haspopup="dialog"
                          onClick={() =>
                            setDetail({
                              company,
                              kind: 'Industries',
                              values: ['Pharmaceuticals'],
                            })
                          }
                        >
                          <span className={ui('record-pill')}>Pharmaceuticals</span>
                          <ChevronDown size={11} />
                        </button>
                      </td>
                      <td>
                        <button
                          className={ui('record-tag-button')}
                          aria-label={`View keywords for ${company.name}`}
                          aria-haspopup="dialog"
                          onClick={() => setDetail({ company, kind: 'Keywords', values: keywords })}
                        >
                          <span className={ui('record-pill')}>{keywords[0]}</span>
                          {keywords.length > 1 && (
                            <span className={ui('record-pill record-more')}>
                              +{keywords.length - 1}
                            </span>
                          )}
                        </button>
                      </td>
                      <td>
                        <RecordTooltip text={`${company.city}, ${company.country}`}>
                          <span className={ui('record-truncate')} tabIndex={0}>
                            {company.city}, {company.country}
                          </span>
                        </RecordTooltip>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {records.length === 0 && (
          <div className={ui('empty-state')}>
            <Search size={30} />
            <h2>
              {hasSearch
                ? 'No matching results'
                : isPeople
                  ? 'Find your next contact'
                  : 'Find your next buyer'}
            </h2>
            <p>
              {hasSearch
                ? 'Try another product, company, or country.'
                : 'Enter a product, company, or country above and select Search.'}
            </p>
            {hasSearch && (
              <button className={ui('button')} onClick={reset}>
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
      {detail && <RecordTagsDialog detail={detail} onClose={closeDetail} />}
    </>
  );
}
