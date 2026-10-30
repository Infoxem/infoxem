import assert from 'node:assert/strict';
import { test } from 'node:test';
import { searchRecords } from '../src/features/directory/filter-records';
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
      directories: {},
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

test('each directory restores draft and submitted criteria separately without losing workspace data', () => {
  const state = parseWorkspace(
    JSON.stringify({
      saved: ['retail-1'],
      notes: { 'retail-1': 'Keep this' },
      directories: {
        buyers: {
          query: 'draft',
          appliedQuery: 'Kenya',
          page: 3,
          sort: 'name',
          refinements: { location: 'Nairobi' },
          appliedRefinements: { type: 'WHOLESALE' },
        },
        people: { query: 'person draft', appliedQuery: 'contact', page: 1, sort: 'match' },
      },
    }),
  );
  const restored = parseWorkspace(JSON.stringify(state));
  assert.equal(restored.directories.buyers?.query, 'draft');
  assert.equal(restored.directories.buyers?.appliedQuery, 'Kenya');
  assert.equal(restored.directories.buyers?.page, 3);
  assert.equal(restored.directories.buyers?.refinements.location, 'Nairobi');
  assert.equal(restored.directories.buyers?.appliedRefinements.type, 'WHOLESALE');
  assert.equal(restored.directories.people?.query, 'person draft');
  assert.deepEqual(restored.saved, ['retail-1']);
  assert.equal(restored.notes['retail-1'], 'Keep this');
});
test('invalid saved directory state falls back without discarding valid workspace records', () => {
  const state = parseWorkspace(
    JSON.stringify({
      saved: ['keep'],
      directories: {
        people: {
          query: 'Kenya',
          appliedQuery: 'Kenya',
          page: -2,
          sort: 'invalid',
          refinements: { country: 123 },
        },
        buyers: { query: false },
      },
    }),
  );
  assert.equal(state.directories.buyers, undefined);
  assert.equal(state.directories.people?.page, 1);
  assert.equal(state.directories.people?.sort, 'match');
  assert.equal(state.directories.people?.refinements.country, '');
  assert.deepEqual(state.saved, ['keep']);
});

test('filter-only submitted searches survive storage separately from unsaved drafts', () => {
  const restored = parseWorkspace(
    JSON.stringify({
      directories: {
        buyers: {
          query: '',
          appliedQuery: '',
          page: 2,
          sort: 'name',
          refinements: { country: 'Other draft country' },
          appliedRefinements: { country: 'Kenya', type: 'WHOLESALE' },
        },
        people: {
          query: '',
          appliedQuery: '',
          refinements: { title: 'Manager' },
          appliedRefinements: { title: 'Director' },
        },
      },
    }),
  );
  const buyers = restored.directories.buyers!;
  assert.equal(buyers.query, '');
  assert.equal(buyers.page, 2);
  assert.equal(buyers.refinements.country, 'Other draft country');
  assert.equal(
    searchRecords('buyers', buyers.appliedQuery, buyers.sort, buyers.appliedRefinements).length,
    602,
  );
  assert.equal(restored.directories.people?.appliedRefinements.title, 'Director');
});
