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

  await tryFill(['input[name="firstName"]', 'input[formcontrolname="firstName"]', 'input[placeholder*="First"]'], 'Auto');
  await tryFill(['input[name="lastName"]', 'input[formcontrolname="lastName"]', 'input[placeholder*="Last"]'], 'Tester');
  await tryFill(['input[type="email"]', 'input[name="email"]', 'input[formcontrolname="email"]'], email);
  await tryFill(['input[type="password"]', 'input[name="password"]', 'input[formcontrolname="password"]'], password);

  const termsCheckbox = page.locator('input[type="checkbox"]').first();
  const hasTerms = (await termsCheckbox.count()) > 0;
  if (hasTerms && !(await termsCheckbox.isChecked())) {
    await termsCheckbox.check();
  }

  const submit = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Register"), button:has-text("Complete Registration")').first();
  await submit.click();

  await page.waitForTimeout(6000);
  const finalUrl = page.url();
  const invalidCount = await page.locator('[aria-invalid="true"]').count();
  const hints = await page.locator('text=/required|invalid|error|must|weak|already|accept|terms|consent|failed|success/i').allTextContents();

  console.log(JSON.stringify({
    email,
    termsChecked: hasTerms,
    finalUrl,
    invalidFields: invalidCount,
    hints: hints.slice(0, 20)
  }, null, 2));

  await browser.close();
})();
