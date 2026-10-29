// Render frames van film.html — deterministisch, jpeg per frame.
// Gebruik: node render.mjs <t0> <t1> <framesDir>
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const V = '/home/suffie/.hermes/profiles/michigami/cache/scratch/vid';
const FPS = 30, W = 1920, H = 1080;
const [t0, t1, outDir] = [parseFloat(process.argv[2] ?? 0), parseFloat(process.argv[3] ?? 10), process.argv[4] ?? (V + '/frames')];
fs.mkdirSync(outDir, { recursive: true });

// film.html uit template + timeline (met nummer-volgorde)
const tl = JSON.parse(fs.readFileSync(V + '/timeline.json', 'utf8'));
const nums = ['', '一', '二', '三', '四', '五', '六', '七'];
tl.scenes.forEach((sc, i) => sc.number = nums[i]);
const st = fs.existsSync(V + '/subtitle_times.json') ? JSON.parse(fs.readFileSync(V + '/subtitle_times.json', 'utf8')) : {};
let html = fs.readFileSync(V + '/film.tpl.html', 'utf8').replace('__TIMELINE__', JSON.stringify(tl)).replace('__SUBTIMES__', JSON.stringify(st));
fs.writeFileSync(V + '/film.html', html);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files', '--force-device-scale-factor=1'] });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', e => { console.error('PAGEERR', e.message); process.exit(2); });
  await page.goto('file://' + V + '/film.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = r; i.onerror = r; }))));
  const start = Math.floor(t0 * FPS), end = Math.floor(t1 * FPS);
  for (let f = start; f < end; f++) {
    const t = f / FPS;
    await page.evaluate(t => window.__setTime(t), t);
    await page.screenshot({ path: path.join(outDir, `f${String(f).padStart(6, '0')}.jpg`), type: 'jpeg', quality: 92 });
    if (f % 150 === 0) console.log(`frame ${f}/${end} (${(t).toFixed(1)}s)`);
  }
  await browser.close();
  console.log('RENDER-KLAAR', outDir, start, end);
})();
