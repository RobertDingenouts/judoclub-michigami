const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  // Mobile viewports to test
  const devices = [
    { name: 'iphone-se', width: 375, height: 667 },
    { name: 'pixel-5', width: 393, height: 851 },
    { name: 'ipad-mini', width: 768, height: 1024 },
  ];

  const pages = ['/', '/#technieken', '/#exameneisen'];
  
  for (const device of devices) {
    console.log(`\n=== Testing ${device.name} (${device.width}px) ===`);
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height }
    });
    const page = await context.newPage();
    
    for (const url of pages) {
      await page.goto(`https://judoclub-michigami.vercel.app${url}`, { waitUntil: 'networkidle' });
      
      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      const title = url.replace('/', '').replace('#', '') || 'home';
      console.log(`  ${title}: ${hasOverflow ? '❌ OVERFLOW' : '✅ OK'}`);
      
      // Screenshot
      await page.screenshot({ 
        path: `./mobile-${device.name}-${title}.png`,
        fullPage: true 
      });
    }
    
    await context.close();
  }
  
  await browser.close();
  console.log('\n✅ Done! Check mobile-*.png files');
})();
