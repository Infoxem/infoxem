// Local resumable browser collection. No Google API, paid service or stealth.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'scrapers/outputs/openserp');
const stateFile = path.join(out, 'batch-progress.json');
const lockFile = path.join(out, 'batch-runner.lock');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let context,
  server,
  lockOwned = false,
  processed = 0,
  total = 0;
let state = {
  status: 'starting',
  batch_size: 5,
  queries_per_company: 2,
  query_spacing_seconds: 45,
  batch_cooldown_seconds: 120,
  processed_this_run: 0,
};
async function exists(name) {
  try {
    await fs.access(path.join(out, name));
    return true;
  } catch {
    return false;
  }
}
async function progress(values) {
  state = {
    ...state,
    ...values,
    message: values.message || '',
    updated_at_utc: new Date().toISOString(),
  };
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}
async function python(args) {
  const result = await run('py', ['-3.13', ...args], { cwd: root, maxBuffer: 5_000_000 });
  return result.stdout;
}
async function exports() {
  await python(['scrapers/openserp/collect.py', '--export-only']);
  await run(process.execPath, ['scrapers/openserp/export.mjs'], { cwd: root, maxBuffer: 2_000_000 });
}
function challenge(url, text) {
  return (
    url.includes('/sorry/') ||
    /unusual traffic from your computer network|not a robot|verify you are human/i.test(text)
  );
}
try {
  await fs.mkdir(out, { recursive: true });
  try {
    const lock = await fs.open(lockFile, 'wx');
    await lock.writeFile(String(process.pid));
    await lock.close();
    lockOwned = true;
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const pid = Number(await fs.readFile(lockFile, 'utf8'));
    let alive = true;
    try {
      process.kill(pid, 0);
    } catch {
      alive = false;
    }
    if (alive) throw new Error('Another batch runner is already active');
    await fs.unlink(lockFile);
    const lock = await fs.open(lockFile, 'wx');
    await lock.writeFile(String(process.pid));
    await lock.close();
    lockOwned = true;
  }
  await progress({ pid: process.pid });
  await python(['scrapers/openserp/batch_processor.py', '--plan']);
  const queue = JSON.parse(await fs.readFile(path.join(out, 'remaining-plan.json'), 'utf8'));
  total = queue.length;
  await progress({ remaining_at_start: total });
  try {
    await fetch('http://127.0.0.1:7071/health');
  } catch {
    server = spawn(
      path.join(root, 'scrapers/openserp/runtime/openserp.exe'),
      ['serve', '--config', 'scrapers/openserp/config.yaml'],
      { cwd: root, windowsHide: true, stdio: 'ignore' },
    );
    let ready = false;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        await fetch('http://127.0.0.1:7071/health');
        ready = true;
        break;
      } catch {}
    }
    if (!ready) throw new Error('Local OpenSERP parser did not start');
  }
  context = await chromium.launchPersistentContext(path.join(out, 'batch-browser-profile'), {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1100, height: 850 },
  });
  const page = context.pages()[0] || (await context.newPage());
  for (const item of queue) {
    if ((await exists('STOP')) || (await exists('PAUSE'))) {
      await progress({ status: 'paused_by_file' });
      break;
    }
    const batch = Math.floor(processed / 5) + 1;
    const name = item.record['Facility Name'].replace(/\([^)]*\)/g, '').trim();
    const queries = [`"${name}" Kenya contact phone`, `${name} official website email contact`];
    const captures = [];
    for (let i = 0; i < queries.length; i++) {
      await progress({
        status: 'searching',
        batch,
        current_company: item.id,
        current_name: name,
        query_number: i + 1,
        current_query: queries[i],
      });
      // Reuse successful captures if a prior run stopped mid-company.
      const filename = path.join(out, `gradual-${item.id}-q${i + 1}.json`);
      if (
        await fs.access(filename).then(
          () => true,
          () => false,
        )
      ) {
        const saved = JSON.parse(await fs.readFile(filename, 'utf8'));
        if (
          saved.visible_text?.includes('Search Results') ||
          /did not match any documents|No results found/.test(saved.visible_text || '')
        ) {
          captures.push(filename);
          continue;
        }
        await fs.rename(filename, filename + '.incomplete-' + Date.now());
      }
      let response;
      if (
        new URL(page.url()).pathname === '/search' &&
        (await page.getByRole('combobox', { name: 'Search', exact: true }).count()) === 1
      ) {
        await page.getByRole('combobox', { name: 'Search', exact: true }).fill(queries[i]);
        await page.getByRole('combobox', { name: 'Search', exact: true }).press('Enter');
        await page.waitForLoadState('domcontentloaded');
      } else
        response = await page.goto(
          'https://www.google.com/search?' +
            new URLSearchParams({ q: queries[i], hl: 'en', gl: 'ke' }),
          { waitUntil: 'domcontentloaded', timeout: 60000 },
        );
      await page.waitForTimeout(2500);
      let text = await page.locator('body').innerText();
      if (challenge(page.url(), text)) {
        await progress({
          status: 'needs_human_verification',
          message:
            'Complete the Google check in the visible Infoxem batch Chrome window. No further searches are being submitted.',
        });
        let dbError = false;
        try {
          await python([
            'scrapers/openserp/record_batch_block.py',
            '--company-id',
            item.id,
            '--query',
            queries[i],
          ]);
          await exports();
        } catch {
          dbError = true;
        }
        if (dbError)
          await progress({
            failure_log_note: 'Block saved in progress; failure-table write failed',
          });
        while (challenge(page.url(), text)) {
          if ((await exists('STOP')) || (await exists('PAUSE')))
            throw new Error('Paused during human verification');
          await sleep(5000);
          text = await page.locator('body').innerText();
        }
        await progress({ status: 'verification_completed' });
      } else if (response && response.status() >= 400) {
        throw new Error(`Search returned HTTP ${response.status()}`);
      }
      if (new URL(page.url()).pathname !== '/search')
        throw new Error('Browser is not on genuine search results');
      await page.waitForFunction(
        () =>
          document.body.innerText.includes('Search Results') ||
          /did not match any documents|No results found/.test(document.body.innerText),
        null,
        { timeout: 60000 },
      );
      const capture = await page.evaluate(() => {
        const titles = Array.from(document.querySelectorAll('[data-attrid="title"]'));
        const phones = Array.from(
          document.querySelectorAll('[data-attrid="kc:/local:alt phone"]'),
        ).map((e) => e.innerText.replace(/^Phone:\s*/i, '').trim());
        const addresses = Array.from(
          document.querySelectorAll('[data-attrid="kc:/location/location:address"]'),
        ).map((e) => e.innerText.replace(/^Address:\s*/i, '').trim());
        const websites = Array.from(document.querySelectorAll('a'))
          .filter((a) => a.innerText.trim() === 'Website')
          .map((a) => a.href)
          .filter((u) => u.startsWith('http'));
        return {
          url: location.href,
          title: document.title,
          html: document.documentElement.outerHTML,
          visible_text: document.body.innerText,
          captured_at_utc: new Date().toISOString(),
          business_panels:
            titles.length === 1
              ? [
                  {
                    name: titles[0].innerText,
                    phone: phones.length === 1 ? phones[0] : null,
                    location: addresses.length === 1 ? addresses[0] : null,
                    website: websites.length === 1 ? websites[0] : null,
                  },
                ]
              : [],
        };
      });
      await fs.writeFile(filename, JSON.stringify(capture));
      captures.push(filename);
      await progress({ status: 'query_saved', capture: path.basename(filename) });
      await sleep(45000);
    }
    await progress({ status: 'processing_sources' });
    await python([
      'scrapers/openserp/batch_processor.py',
      '--company-id',
      item.id,
      '--captures',
      ...captures,
    ]);
    await exports();
    processed++;
    await progress({
      status: 'company_saved',
      processed_this_run: processed,
      remaining_this_run: total - processed,
    });
    if (processed % 5 === 0) {
      await progress({ status: 'batch_cooldown' });
      await sleep(120000);
    }
  }
  if (processed === total) await progress({ status: 'complete' });
} catch (error) {
  if (lockOwned) await progress({ status: 'stopped_on_error', error: String(error.message) });
  else console.error(error.message);
} finally {
  if (context) await context.close().catch(() => {});
  if (server) server.kill();
  if (lockOwned) await fs.unlink(lockFile).catch(() => {});
}
