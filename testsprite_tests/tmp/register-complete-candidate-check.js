const { chromium } = require('playwright');

(async () => {
  const email = `candidate.${Date.now()}@example.com`;
  const password = 'Str0ng!Pass123';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const apiEvents = [];
  page.on('response', async (resp) => {
    if (resp.url().includes('/api/')) {
      let body = '';
      try { body = await resp.text(); } catch {}
      apiEvents.push({ status: resp.status(), url: resp.url(), body: body.slice(0, 500) });
    }
  });

  const fill = async (selector, value) => {
    const l = page.locator(selector).first();
    if (await l.count()) {
      await l.fill(value);
      return true;
    }
    return false;
  };

  await page.goto('http://localhost:4200/register', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  await fill('input[formcontrolname="firstName"]', 'Auto');
  await fill('input[formcontrolname="lastName"]', 'Tester');
  await fill('input[formcontrolname="email"]', email);
  await fill('input[formcontrolname="password"]', password);
  await fill('input[formcontrolname="phoneNumber"]', '+201001112233');
  await fill('input[formcontrolname="dateOfBirth"]', '1998-05-21');

  const gender = page.locator('select[formcontrolname="gender"]').first();
  if (await gender.count()) {
    try { await gender.selectOption('Male'); } catch { try { await gender.selectOption('male'); } catch {} }
  }

  const terms = page.locator('input[formcontrolname="terms"]').first();
  if ((await terms.count()) > 0 && !(await terms.isChecked())) {
    await terms.check();
  }

  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(7000);

  const invalidControls = await page.evaluate(() => Array.from(document.querySelectorAll('.ng-invalid[formcontrolname]')).map(e => e.getAttribute('formcontrolname')));

  console.log(JSON.stringify({
    email,
    finalUrl: page.url(),
    invalidControls,
    apiEvents: apiEvents.slice(0, 20)
  }, null, 2));

  await browser.close();
})();
