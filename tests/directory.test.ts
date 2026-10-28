import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_CRITERIA,
  filterRecords,
  searchRecords,
} from '../src/features/directory/filter-records';
import { companies, people, getCompanyById } from '../src/lib/demo-data';

test('discovery stays empty without a meaningful product, company, or country search', () => {
  for (const kind of ['buyers', 'people'] as const) {
    for (const query of ['', '   ', 'in and for']) assert.deepEqual(searchRecords(kind, query), []);
  }
});

test('discovery matches products, company names, and countries for buyers and people', () => {
  assert.equal(searchRecords('buyers', 'Kenya').length, 3);
  assert.deepEqual(
    searchRecords('buyers', 'Meridian').map((record) => record.id),
    ['meridian'],
  );
  assert.equal(searchRecords('people', 'Meridian').length, 3);
  assert.equal(searchRecords('people', 'Generics in Kenya').length, 4);
  assert.deepEqual(searchRecords('buyers', 'no-such-product'), []);
});

test('combined product and market filters return only relevant buyers', () => {
  const matches = filterRecords(
    'buyers',
    { ...DEFAULT_CRITERIA, country: 'Kenya', product: 'Generics' },
    [],
  );
  assert.deepEqual(
    matches.map((r) => r.id),
    ['meridian', 'crown'],
  );
});
test('people search combines employer products with role and location', () => {
  const matches = filterRecords(
    'people',
    { ...DEFAULT_CRITERIA, query: 'Generics in Kenya', seniority: 'Head' },
    [],
  );
  assert.deepEqual(
    matches.map((r) => r.id),
    ['amina-otieno'],
  );
});
test('saved records and list membership are both respected', () => {
  const matches = filterRecords(
    'buyers',
    { ...DEFAULT_CRITERIA, savedOnly: true, listIds: ['meridian', 'atlas'] },
    ['atlas', 'novacare'],
  );
  assert.deepEqual(
    matches.map((r) => r.id),
    ['atlas'],
  );
  assert.equal(filterRecords('buyers', { ...DEFAULT_CRITERIA, listIds: [] }, []).length, 0);
});

test('company refinements combine domain, city, size, and description keywords', () => {
  assert.deepEqual(
    filterRecords(
      'buyers',
      {
        ...DEFAULT_CRITERIA,
        query: 'Kenya',
        company: 'meridian.example',
        location: 'nairobi',
        size: '51–200',
        keywords: 'nonexistent, hospitals',
      },
      [],
    ).map((record) => record.id),
    ['meridian'],
  );
  assert.equal(
    filterRecords('buyers', { ...DEFAULT_CRITERIA, company: 'Meridian', location: 'Dubai' }, [])
      .length,
    0,
  );
});

test('job title refinements match roles at the searched employer', () => {
  assert.deepEqual(
    filterRecords(
      'people',
      { ...DEFAULT_CRITERIA, query: 'Meridian', title: 'procurement', seniority: 'Head' },
      [],
    ).map((record) => record.id),
    ['amina-otieno'],
  );
});
test('every demo contact points to an existing company and all record IDs are unique', () => {
  assert.equal(
    new Set([...companies, ...people].map((record) => record.id)).size,
    companies.length + people.length,
  );
  for (const person of people) assert.ok(getCompanyById(person.company));
});
