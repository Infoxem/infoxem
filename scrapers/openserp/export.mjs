import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Workbook } from '@oai/artifact-tool';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'scrapers/outputs/openserp');
const tables = JSON.parse(await fs.readFile(path.join(output, 'tables.json'), 'utf8'));
const defaultColumns = {
  candidates: [
    'infoxem_id',
    'collected_at_utc',
    'google_source_url',
    'title',
    'url',
    'snippet',
    'engine',
    'match_status',
  ],
  observations: [
    'infoxem_id',
    'field',
    'value',
    'source_url',
    'collected_at_utc',
    'match_status',
    'scope',
  ],
  failures: [
    'attempt_id',
    'infoxem_id',
    'stage',
    'status',
    'collected_at_utc',
    'source_url',
    'error',
  ],
};
function text(value) {
  const result =
    value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /^[=+@\-\t\r]/.test(result) ? "'" + result : result;
}
const audit = {};
for (const [name, rows] of Object.entries(tables)) {
  const columns = [...new Set([...(defaultColumns[name] || []), ...rows.flatMap(Object.keys)])];
  const workbook = Workbook.create();
  const sheet = workbook.worksheets.add('Data');
  const matrix = [columns, ...rows.map((row) => columns.map((column) => text(row[column])))];
  sheet.getRangeByIndexes(0, 0, matrix.length, columns.length).values = matrix;
  workbook.recalculate();
  const values = sheet.getRangeByIndexes(0, 0, matrix.length, columns.length).values;
  if (values.length !== matrix.length || values[0].length !== columns.length)
    throw new Error('CSV dimensions differ from source');
  const csv =
    '\ufeff' +
    values
      .map((row) =>
        row.map((cell) => '"' + String(cell ?? '').replaceAll('"', '""') + '"').join(','),
      )
      .join('\r\n') +
    '\r\n';
  await fs.writeFile(path.join(output, `infoxem_${name}.csv`), csv, 'utf8');
  audit[name] = { rows: rows.length, columns: columns.length };
  console.log(`${name}: ${rows.length} rows`);
}
await fs.writeFile(path.join(output, 'csv-validation.json'), JSON.stringify(audit, null, 2));
