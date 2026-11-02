import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(new URL('../openserp/export.mjs', import.meta.url));
const { Workbook } = await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const out = new URL('../outputs/scrapy/', import.meta.url);
const tables = JSON.parse(await fs.readFile(new URL('tables.json', out), 'utf8'));
const safe = (value) => {
  const s = String(value ?? '');
  return /^[=+@\-\t\r]/.test(s) ? "'" + s : s;
};
for (const [name, rows] of Object.entries(tables)) {
  const columns = [...new Set(rows.flatMap(Object.keys))];
  if (!columns.length) columns.push('infoxem_id', 'status', 'source_url', 'collected_at_utc');
  const matrix = [columns, ...rows.map((row) => columns.map((c) => safe(row[c])))];
  const wb = Workbook.create();
  const sheet = wb.worksheets.add('Data');
  sheet.getRangeByIndexes(0, 0, matrix.length, columns.length).values = matrix;
  const values = sheet.getRangeByIndexes(0, 0, matrix.length, columns.length).values;
  const csv =
    '\ufeff' +
    values
      .map((row) => row.map((v) => '"' + String(v ?? '').replaceAll('"', '""') + '"').join(','))
      .join('\r\n') +
    '\r\n';
  await fs.writeFile(new URL(name + '.csv', out), csv);
  console.log(`${name}: ${rows.length} rows`);
}
