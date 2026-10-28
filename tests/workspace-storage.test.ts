import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EMPTY_WORKSPACE, loadWorkspace, parseWorkspace } from '../src/lib/workspace-storage';

test('corrupt or incorrectly shaped browser data produces a usable workspace', () => {
  for (const raw of ['not json', 'null', '[]', '42'])
    assert.deepEqual(parseWorkspace(raw), EMPTY_WORKSPACE);
  assert.deepEqual(
    parseWorkspace(
      '{"saved":["meridian",12,"meridian"],"notes":{"meridian":"Follow up","bad":3},"lists":[null,{"name":"Kenya","ids":["meridian",null]}]}',
    ),
    {
      saved: ['meridian'],
      lists: [{ name: 'Kenya', ids: ['meridian'] }],
      notes: { meridian: 'Follow up' },
      requests: [],
    },
  );
});
test('existing prototype bookmarks and lists survive migration', () => {
  const legacy: Record<string, string> = {
    'infoxem-saved': '["meridian"]',
    'infoxem-lists': '[{"name":"Export partners","ids":["meridian"]}]',
    'infoxem-notes': '{"meridian":"Call next week"}',
  };
  const state = loadWorkspace({ getItem: (key) => legacy[key] ?? null });
  assert.deepEqual(state.saved, ['meridian']);
  assert.equal(state.lists[0].name, 'Export partners');
  assert.equal(state.notes.meridian, 'Call next week');
});
