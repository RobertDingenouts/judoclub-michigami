// verify3.mjs — geometrie/timing-check van film3 zonder naar plaatjes te kijken.
import { chromium } from 'playwright';
import fs from 'fs';

const V = '/home/suffie/.hermes/profiles/michigami/cache/scratch/vid';
const A = V + '/v3';
const tl = JSON.parse(fs.readFileSync(A + '/timeline2.json', 'utf8'));
const meta = JSON.parse(fs.readFileSync(V + '/scene_meta.json', 'utf8'));
const subs = JSON.parse(fs.readFileSync(A + '/subs2.json', 'utf8'));
const st = JSON.parse(fs.readFileSync(A + '/subtitle_times2.json', 'utf8'));
const art = (f) => fs.existsSync(V+'/svg/'+f)
  ? fs.readFileSync(V+'/svg/'+f,'utf8').replace(/`/g,'\\`').replace(/\$\{/g,'\\${') : '';
let html = fs.readFileSync(V + '/film3.tpl.html', 'utf8')
  .replace('__ART__', JSON.stringify(Object.fromEntries(fs.readdirSync(V + '/svg').filter(f=>f.endsWith('.svg')).map(f=>[f.replace(/\.svg$/,''), fs.readFileSync(V + '/svg/' + f, 'utf8')]))))
  .replace('__TIMELINE__', JSON.stringify(tl))
  .replace('__SCENEMETA__', JSON.stringify(meta))
  .replace('__SUBTIMES__', JSON.stringify(st))
  .replace('__SUBS__', JSON.stringify(subs))
  .replace('__WORDS__', fs.existsSync(A+'/wordtimes2.json') ? fs.readFileSync(A+'/wordtimes2.json','utf8') : '{}');
const tmp = V + '/film3-probe.html';
fs.writeFileSync(tmp, html);

const b = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files','--force-device-scale-factor=1','--disable-gpu'] });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('pageerror', e => console.log('PAGEERROR', e.message));
pg.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await pg.goto('file://' + tmp);
await pg.waitForTimeout(900);

function snap(t) {
  return pg.evaluate((t) => {
    window.__setTime(t);
    const secs = [...document.querySelectorAll('.scene')];
    const out = [];
    secs.forEach((sec, i) => {
      const sop = +getComputedStyle(sec).opacity;
      if (sop < .02) return;
      const subsEl = [...sec.querySelectorAll('.subs p')].map((p, j) => ({ j, op: +getComputedStyle(p).opacity, box: p.getBoundingClientRect() }));
      const figs = [...sec.querySelectorAll('figure.m')].map((f, j) => {
        const im = f.querySelector('img');
        return { j, op: +getComputedStyle(f).opacity, box: im ? im.getBoundingClientRect() : null };
      });
      const fx = {};
      sec.querySelectorAll('.fx g[id]').forEach(g => { fx[g.id] = +g.getAttribute('opacity'); });
      sec.querySelectorAll('.fx .artbox').forEach(g => { fx['art:' + g.dataset.art] = +g.getAttribute('opacity'); });
      const artInfo = [...sec.querySelectorAll('figure.artfig')].map(f => {
        const svg = f.querySelector('svg');
        const fr = f.querySelector('.artframe');
        const r = fr ? fr.getBoundingClientRect() : null;
        return { art: f.dataset.art, svg: !!svg, shapes: svg ? svg.querySelectorAll('path,polyline,line,circle,rect,polygon').length : 0,
                 op: +getComputedStyle(f).opacity, box: r ? {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)} : null };
      });
      const artShapes = artInfo.reduce((a,b)=>a+b.shapes,0);
      let tiles = 0, tilesTotal = 0, belts = 0, rows = 0;
      sec.querySelectorAll('.fx .tile').forEach(t2 => { tilesTotal++; if (+t2.getAttribute('opacity') > .5) tiles++; });
      sec.querySelectorAll('.fx .belt').forEach(t2 => { if (+t2.getAttribute('opacity') > .5) belts++; });
      sec.querySelectorAll('.fx .row').forEach(t2 => { if (+t2.getAttribute('opacity') > .5) rows++; });
      const cnt = sec.querySelector('#aant .cnt') ? sec.querySelector('#aant .cnt').textContent : null;
      out.push({
        i, scene: sec.className, sop,
        subs: subsEl.filter(s => s.op > .05).map(s => ({ j: s.j, op: +s.op.toFixed(2), x: Math.round(s.box.x), y: Math.round(s.box.y), w: Math.round(s.box.width), h: Math.round(s.box.height) })),
        figs: figs.filter(f => f.op > .05).map(f => ({ j: f.j, op: +f.op.toFixed(2), box: f.box ? { x: Math.round(f.box.x), y: Math.round(f.box.y), w: Math.round(f.box.width), h: Math.round(f.box.height) } : null })),
        fx, artInfo, artShapes, tiles, tilesTotal, belts, rows, cnt
      });
    });
    return out;
  }, t);
}

const probes = process.argv.slice(2).map(Number);
for (const t of probes) {
  const s = await snap(t);
  console.log('=== t=' + t, JSON.stringify(s, null, 0));
}
await b.close();
