const { chromium } = require('./node_modules/playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.setViewportSize({ width: 1440, height: 860 });
  const errors = [];
  p.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
  await p.goto('file:///c:/Users/panna/Documents/GitHub/TheMigrationGame/index.html', { waitUntil:'networkidle' });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: 'ss1.png' });

  // Select Syria and start
  const opts = await p.$$('.ss-opt');
  console.log('Country options:', opts.length);
  await opts[2].click();
  await p.waitForTimeout(200);
  await p.click('#ssStart');
  await p.waitForTimeout(2000);
  await p.screenshot({ path: 'ss2.png' });

  // Check key elements
  const map = await p.$('#worldMap');
  const lands = await p.$$('.land');
  const nodes = await p.$$('.cn-o, .cn-d');
  const cards = await p.$$('.card');
  console.log('Map SVG:', !!map);
  console.log('Continent paths:', lands.length);
  console.log('Country nodes:', nodes.length);
  console.log('Cards rendered:', cards.length);
  console.log('JS errors:', errors.length ? errors : 'none');

  // Wait for decision phase buttons
  await p.waitForTimeout(1000);
  const stayBtn = await p.$('#btnStay');
  const visible = stayBtn ? await stayBtn.isVisible() : false;
  console.log('Decision buttons visible:', visible);
  await p.screenshot({ path: 'ss3.png' });

  await b.close();
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
