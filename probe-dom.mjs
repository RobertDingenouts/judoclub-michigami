import { chromium } from 'playwright';
const [,, tpl, tArg] = process.argv;
const browser = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files','--force-device-scale-factor=1','--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + tpl);
await page.waitForFunction('typeof __setTime === "function"');
await page.evaluate(t => __setTime(t), parseFloat(tArg));
await page.waitForTimeout(120);
const rects = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('#aant text').forEach(el => {
    const r = el.getBoundingClientRect();
    out.push({ txt: el.textContent.slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: el.getAttribute('opacity') || getComputedStyle(el).opacity });
  });
  const fx = document.querySelector('#s9 .fx svg') || document.querySelector('.fx svg');
  const fr = fx ? fx.getBoundingClientRect() : null;
  return { out, fx: fr ? { x: Math.round(fr.x), y: Math.round(fr.y), w: Math.round(fr.width), h: Math.round(fr.height) } : null };
});
console.log(JSON.stringify(rects, null, 1));
await browser.close();
