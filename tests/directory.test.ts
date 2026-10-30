import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_CRITERIA,
  filterRecords,
  searchRecords,
} from '../src/features/directory/filter-records';
import {
  companies,
  people,
  superintendents,
  getCompanyById,
  getPersonById,
} from '../src/lib/demo-data';

test('discovery stays empty until a meaningful search', () => {
  for (const kind of ['buyers', 'people'] as const)
    for (const query of ['', '   ', 'in and for']) assert.deepEqual(searchRecords(kind, query), []);
});
test('all imported facilities are searchable and missing products are not invented', () => {
  assert.equal(companies.length, 8804);
  assert.equal(searchRecords('buyers', 'Kenya').length, 8804);
  assert.equal(searchRecords('buyers', 'CUREWAVE').length, 1);
  assert.equal(searchRecords('people', 'CUREWAVE').length, 0);
  assert.ok(
    searchRecords('buyers', 'Generics in Kenya').every((r) =>
      r.name.toLowerCase().includes('generics'),
    ),
  );
  assert.equal(searchRecords('buyers', 'no-such-product').length, 0);
});
test('market and business-type filters combine', () => {
  assert.equal(
    filterRecords('buyers', { ...DEFAULT_CRITERIA, country: 'Kenya', type: 'WHOLESALE' }, [])
      .length,
    602,
  );
  assert.equal(
    filterRecords('buyers', { ...DEFAULT_CRITERIA, country: 'Kenya', product: 'Generics' }, [])
      .length,
    0,
  );
});
test('superintendents are separate from People and company contact counts', () => {
  assert.equal(people.length, 0);
  assert.equal(superintendents.length, 8790);
  assert.equal(searchRecords('people', 'SAMUEL NJAGI').length, 0);
  const record = superintendents.find((p) => p.name === 'SAMUEL NJAGI')!;
  assert.ok(record);
  assert.equal(record.cadre, 'PHARMTECH');
  assert.equal(getPersonById(record.id), undefined);
  assert.equal(getCompanyById(record.company)?.contacts, 0);
  assert.ok(companies.every((company) => company.contacts === 0));
  assert.ok(superintendents.every((record) => getCompanyById(record.company)));
  assert.equal(new Set(superintendents.map((record) => record.id)).size, superintendents.length);
});
test('saved records and list membership are both respected', () => {
  const [a, b, c] = companies;
  assert.deepEqual(
    filterRecords('buyers', { ...DEFAULT_CRITERIA, savedOnly: true, listIds: [a.id, b.id] }, [
      b.id,
      c.id,
    ]).map((r) => r.id),
    [b.id],
  );
  assert.equal(filterRecords('buyers', { ...DEFAULT_CRITERIA, listIds: [] }, []).length, 0);
});
test('company and location refinements reject conflicting locations', () => {
  const company = companies.find((c) => c.city === 'Nairobi')!;
  assert.ok(
    filterRecords(
      'buyers',
      { ...DEFAULT_CRITERIA, company: company.name, location: 'nairobi' },
      [],
    ).some((c) => c.id === company.id),
  );
  assert.equal(
    filterRecords('buyers', { ...DEFAULT_CRITERIA, company: company.name, location: 'Dubai' }, [])
      .length,
    0,
  );
});
test('all company/person IDs resolve uniquely without invented contact details', () => {
  assert.equal(
    new Set([...companies, ...people].map((r) => r.id)).size,
    companies.length + people.length,
  );
  assert.equal(people.length, 0);
  for (const p of people) {
    assert.ok(getCompanyById(p.company));
    assert.equal(getPersonById(p.id), p);
    assert.equal(p.email, false);
  }
  for (const c of companies) {
    assert.equal(c.domain, '');
    assert.deepEqual(c.products, []);
  }
});
