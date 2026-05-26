const { chromium } = require('./node_modules/playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.setViewportSize({ width: 1440, height: 860 });
  const errors = [];
  p.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
  await p.goto('file:///c:/Users/panna/Documents/GitHub/TheMigrationGame/index.html', {waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'map_start.png' });

  const opts = await p.$$('.ss-opt');
  await opts[0].click(); // Mexico
  await p.waitForTimeout(200);
  await p.click('#ssStart');
  await p.waitForTimeout(2200);
  await p.screenshot({ path: 'map_game.png' });

  const lands = await p.$$('.land');
  console.log('Land paths:', lands.length);
  console.log('JS errors:', errors.length ? errors : 'none');
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
