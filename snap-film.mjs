// Snapshot-test: 12 keyframes uit de layout, zonder echte audio.
import { chromium } from 'playwright';
import fs from 'fs';

const V = '/home/suffie/.hermes/profiles/michigami/cache/scratch/vid';
const FPS = 30;
const scenes = [];
for (let i = 0; i < 12; i++) scenes.push({ id: 's' + i, start: 1 + i * 10, dur: 10, sceneDur: 10 });
const tl = { fps: FPS, total: 121, scenes };
const meta = JSON.parse(fs.readFileSync(V + '/scene_meta.json', 'utf8'));
const subs = JSON.parse(fs.readFileSync(V + '/subs2.json', 'utf8'));
let html = fs.readFileSync(V + '/film2.tpl.html', 'utf8')
  .replace('__TIMELINE__', JSON.stringify(tl))
  .replace('__SCENEMETA__', JSON.stringify(meta))
  .replace('__SUBTIMES__', JSON.stringify({}))
  .replace('__SUBS__', JSON.stringify(subs));
fs.writeFileSync(V + '/film-test.html', html);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files', '--force-device-scale-factor=1', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => { console.error('PAGEERR', e.message); process.exit(2); });
  await page.goto('file://' + V + '/film-test.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = r; i.onerror = r; }))));
  for (let i = 0; i < 12; i++) {
    const t = 1 + i * 10 + 5;
    await page.evaluate(async t => {
      window.__setTime(t);
      const imgs = [...document.querySelectorAll('img.clipimg')];
      await Promise.all(imgs.map(i => i.decode().catch(() => {})));
    }, t);
    await page.screenshot({ path: `${V}/test_s${i}.jpg`, type: 'jpeg', quality: 90 });
    console.log('test', i, t);
  }
  await browser.close();
  console.log('TEST-KLAAR');
})();
