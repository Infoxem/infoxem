'use client';

import { ui } from '@/lib/ui';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Layers, Plus } from 'lucide-react';
import { companies } from '@/lib/demo-data';
import { useWorkspace } from '@/providers/workspace-provider';

export function ListDialog() {
  const { saved, lists, setLists, listRecordIds, setModal, notify } = useWorkspace();
  const [listName, setListName] = useState('');
  const router = useRouter();
  return (
    <>
      <h2 id="modal-title">Keep your opportunities together.</h2>
      <p>
        Add {listRecordIds.length || 'saved'} records to a new list, or revisit an existing list.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const ids = listRecordIds.length ? listRecordIds : saved;
          if (!listName.trim()) return;
          setLists((prev) => [...prev, { name: listName.trim(), ids: [...ids] }]);
          setModal(null);
          setListName('');
          notify(`Created “${listName.trim()}” with ${ids.length} records`);
        }}
      >
        <label className={ui('field-label')}>
          List name
          <input
            autoFocus
            required
            maxLength={80}
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="e.g. East Africa distributors"
          />
        </label>
        <button className={ui('button primary wide')} type="submit">
          <Plus size={15} /> Create list
        </button>
      </form>
      {lists.length > 0 && (
        <div className={ui('existing-lists')}>
          <h3>Your lists</h3>
          {lists.map((list, i) => (
            <div className={ui('existing-list-row')} key={i}>
              <button
                onClick={() => {
                  setModal(null);
                  router.push(
                    `/${list.ids.some((key) => companies.some((c) => c.id === key)) ? 'buyers' : 'people'}?list=${i}`,
                  );
                }}
              >
                <Layers size={16} />
                <span>
                  {list.name}
                  <small>{list.ids.length} records</small>
                </span>
                <ArrowUpRight size={15} />
              </button>
              {listRecordIds.length > 0 && (
                <button
                  className={ui('button')}
                  onClick={() => {
                    setLists((prev) =>
                      prev.map((item, index) =>
                        index === i
                          ? { ...item, ids: [...new Set([...item.ids, ...listRecordIds])] }
                          : item,
                      ),
                    );
                    setModal(null);
                    notify(`Added selection to “${list.name}”`);
                  }}
                >
                  Add selected
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
