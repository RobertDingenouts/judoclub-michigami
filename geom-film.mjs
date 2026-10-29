import { chromium } from 'playwright';
import fs from 'fs';
const V = '/home/suffie/.hermes/profiles/michigami/cache/scratch/vid';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + V + '/film-test.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = r; i.onerror = r; }))));
  for (let i = 0; i < 12; i++) {
    const t = 1 + i * 10 + 5;
    const g = await page.evaluate(async t => {
      window.__setTime(t);
      await new Promise(r => setTimeout(r, 60));
      const rect = el => { const r = el.getBoundingClientRect(); return {x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), op:parseFloat(getComputedStyle(el).opacity)}; };
      const sec = document.querySelectorAll('.scene')[Math.floor((t-1)/10)];
      const subs = [...sec.querySelectorAll('.subs p')].map(p => ({...rect(p), txt:p.textContent.slice(0,80)}));
      const visSubs = subs.filter(s => s.op > 0.3);
      const media = sec.querySelector('.media');
      return {
        id: sec.className,
        title: rect(sec.querySelector('.title')),
        chap: rect(sec.querySelector('.chapter')),
        media: rect(media),
        mediaH: Math.round(media.scrollHeight),
        subs: visSubs,
        figs: [...sec.querySelectorAll('figure.m')].map(f => ({...rect(f), cap:f.querySelector('figcaption')?.textContent.slice(0,60), img:f.querySelector('img')?.naturalWidth, src:f.querySelector('img')?.getAttribute('src')?.slice(-40)}))
      };
    }, t);
    const overlap = (a,b) => !(a.x+a.w <= b.x || b.x+b.w <= a.x || a.y+a.h <= b.y || b.y+b.h <= a.y);
    const probs = [];
    if (g.title.op > .1 && overlap(g.title, g.media)) probs.push('TITLE-MEDIA');
    for (const s of g.subs) if (overlap(s, g.media)) probs.push('SUB-MEDIA:'+s.txt.slice(0,25));
    console.log(JSON.stringify({i, t, ...g, probs}));
  }
  await browser.close();
})();
