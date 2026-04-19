const { chromium } = require('playwright');

(async () => {
  const email = `candidate.${Date.now()}@example.com`;
  const password = 'Str0ng!Pass123';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const apiEvents = [];
  const consoleErrors = [];

  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/api/')) {
      apiEvents.push({ type: 'response', status: resp.status(), url });
    }
  });

  page.on('requestfailed', (req) => {
    const url = req.url();
    if (url.includes('/api/')) {
      apiEvents.push({ type: 'requestfailed', reason: req.failure()?.errorText || 'unknown', url });
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const tryFill = async (selectors, value) => {
    for (const s of selectors) {
      const l = page.locator(s).first();
      if (await l.count()) {
        await l.fill(value);
        return true;
      }
    }
    return false;
  };

  await page.goto('http://localhost:4200/register', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  await tryFill(['input[name="firstName"]', 'input[formcontrolname="firstName"]', 'input[placeholder*="First"]'], 'Auto');
  await tryFill(['input[name="lastName"]', 'input[formcontrolname="lastName"]', 'input[placeholder*="Last"]'], 'Tester');
  await tryFill(['input[type="email"]', 'input[name="email"]', 'input[formcontrolname="email"]'], email);
  await tryFill(['input[type="password"]', 'input[name="password"]', 'input[formcontrolname="password"]'], password);

  const termsCheckbox = page.locator('input[type="checkbox"]').first();
  if ((await termsCheckbox.count()) > 0 && !(await termsCheckbox.isChecked())) {
    await termsCheckbox.check();
  }

  await page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Register"), button:has-text("Complete Registration")').first().click();
  await page.waitForTimeout(7000);

  console.log(JSON.stringify({
    email,
    finalUrl: page.url(),
    apiEvents: apiEvents.slice(0, 20),
    consoleErrors: consoleErrors.slice(0, 20)
  }, null, 2));

  await browser.close();
})();
