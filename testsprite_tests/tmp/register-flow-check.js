const { chromium } = require('playwright');

(async () => {
  const email = `candidate.${Date.now()}@example.com`;
  const password = 'Str0ng!Pass123';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

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

  const first = await tryFill(['input[name="firstName"]', 'input[formcontrolname="firstName"]', 'input[placeholder*="First"]'], 'Auto');
  const last = await tryFill(['input[name="lastName"]', 'input[formcontrolname="lastName"]', 'input[placeholder*="Last"]'], 'Tester');
  const emailOk = await tryFill(['input[type="email"]', 'input[name="email"]', 'input[formcontrolname="email"]'], email);
  const pass = await tryFill(['input[type="password"]', 'input[name="password"]', 'input[formcontrolname="password"]'], password);

  const submitSelectors = [
    'button:has-text("Register")',
    'button:has-text("Sign Up")',
    'button:has-text("Create")',
    'button:has-text("Complete Registration")',
    'button[type="submit"]'
  ];

  let submitted = false;
  for (const s of submitSelectors) {
    const btn = page.locator(s).first();
    if (await btn.count()) {
      await btn.click();
      submitted = true;
      break;
    }
  }

  await page.waitForTimeout(5000);
  const finalUrl = page.url();
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ').trim();

  const validationHints = await page
    .locator('text=/required|invalid|error|must|weak|already|accept|terms|consent/i')
    .allTextContents();
  const invalidCount = await page.locator('[aria-invalid="true"]').count();

  console.log(JSON.stringify({
    email,
    fieldsFilled: { first, last, email: emailOk, password: pass },
    submitted,
    finalUrl,
    invalidFields: invalidCount,
    validationHints: validationHints.slice(0, 20),
    bodyPreview: body.slice(0, 220)
  }, null, 2));

  await browser.close();
})();
