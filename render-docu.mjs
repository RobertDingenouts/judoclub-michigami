// Render frames van film2.html — deterministisch, jpeg per frame.
// Gebruik: node render-docu.mjs <t0> <t1> <framesDir>
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const V = '/home/suffie/.hermes/profiles/michigami/cache/scratch/vid';
const FPS = 30, W = 1920, H = 1080;
const [t0, t1, outDir] = [parseFloat(process.argv[2] ?? 0), parseFloat(process.argv[3] ?? 10), process.argv[4] ?? (V + '/frames2')];
fs.mkdirSync(outDir, { recursive: true });

const tl = JSON.parse(fs.readFileSync((process.env.ARTDIR || V) + '/timeline2.json', 'utf8'));
const meta = JSON.parse(fs.readFileSync(V + '/scene_meta.json', 'utf8'));
const subs = JSON.parse(fs.readFileSync((process.env.ARTDIR || V) + '/subs2.json', 'utf8'));
const st = fs.existsSync((process.env.ARTDIR || V) + '/subtitle_times2.json') ? JSON.parse(fs.readFileSync((process.env.ARTDIR || V) + '/subtitle_times2.json', 'utf8')) : {};
const artMap = {};
for (const f of fs.readdirSync(V + '/svg'))
  if (f.endsWith('.svg')) artMap[f.replace(/\.svg$/, '')] = fs.readFileSync(V + '/svg/' + f, 'utf8');
let html = fs.readFileSync(process.env.TPL || (V + '/film2.tpl.html'), 'utf8')
  .replace('__WORDS__', fs.existsSync((process.env.ARTDIR || V) + '/wordtimes2.json') ? fs.readFileSync((process.env.ARTDIR || V) + '/wordtimes2.json', 'utf8') : '{}')
  .replace('__ART__', JSON.stringify(artMap))
  .replace('__TIMELINE__', JSON.stringify(tl))
  .replace('__SCENEMETA__', JSON.stringify(meta))
  .replace('__SUBTIMES__', JSON.stringify(st))
  .replace('__SUBS__', JSON.stringify(subs));
fs.writeFileSync(V + '/film2.html', html);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files', '--force-device-scale-factor=1', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', e => { console.error('PAGEERR', e.message); process.exit(2); });
  await page.goto('file://' + V + '/film2.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = r; i.onerror = r; }))));
  const start = Math.floor(t0 * FPS), end = Math.floor(t1 * FPS);
  for (let f = start; f < end; f++) {
    const t = f / FPS;
    await page.evaluate(async t => {
      window.__setTime(t);
      const imgs = [...document.querySelectorAll('img.clipimg')];
      await Promise.all(imgs.map(i => i.decode().catch(() => {})));
    }, t);
    await page.screenshot({ path: path.join(outDir, `f${String(f).padStart(6, '0')}.jpg`), type: 'jpeg', quality: 92 });
    if (f % 150 === 0) console.log(`frame ${f}/${end} (${t.toFixed(1)}s)`);
  }
  await browser.close();
  console.log('RENDER-KLAAR', outDir, start, end);
})();
