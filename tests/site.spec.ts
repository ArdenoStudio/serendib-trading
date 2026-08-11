import { expect, test } from '@playwright/test';

// `vite preview` can't run Vercel serverless functions, so the inventory API is
// unavailable in this environment. Stub it so the pages render real content and
// the console stays clean — otherwise "Failed to fetch vehicles" is an expected
// artifact of the test harness, not a client bug.
const stubVehicles = async (page: import('@playwright/test').Page) => {
  await page.route('**/api/db/vehicles', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'test-1',
          make: 'Toyota',
          model: 'Land Cruiser Prado',
          year: 2022,
          price: 48500000,
          mileage: 45000,
          fuel: 'Diesel',
          transmission: 'Automatic',
          bodyType: 'SUV',
          condition: 'Registered',
          color: 'White',
          image: '',
          gallery: [],
          is_sold: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]),
    })
  );
};

const routes = [
  { path: '/', heading: /drive/i },
  { path: '/inventory', heading: /available\s+inventory/i },
  { path: '/about', heading: /driven\s+by\s+passion/i },
  { path: '/gallery', heading: /the\s+gallery/i },
  { path: '/calculator', heading: /estimate\s+payments/i },
  { path: '/contact', heading: /contact\s+serendib/i },
  { path: '/admin/login', heading: /dashboard\s+access/i },
];

test.describe('public route smoke', () => {
  for (const route of routes) {
    test(`${route.path} renders without client errors`, async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (message) => {
        if (message.type() === 'error') {
          errors.push(message.text());
        }
      });
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await stubVehicles(page);
      await page.goto(route.path);
      await expect(page.locator('h1').first()).toContainText(route.heading);
      await expect(page.locator('body')).not.toHaveText('');
      expect(errors).toEqual([]);
    });
  }
});

test('inventory renders listings from the API', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await stubVehicles(page);
  await page.goto('/inventory');
  await expect(page.locator('h1').first()).toContainText(/available\s+inventory/i);
  await expect(page.getByText(/Land Cruiser Prado/i).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('homepage hero CTAs stay equal-sized and aligned', async ({ page }, testInfo) => {
  await stubVehicles(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  const hero = page.locator('section').first();
  const explore = hero.locator('a[href="/inventory"]').first();
  const contact = hero.locator('a[href="/contact"]').first();

  await expect(explore).toBeVisible();
  await expect(contact).toBeVisible();

  const exploreBox = (await explore.boundingBox())!;
  const contactBox = (await contact.boundingBox())!;

  expect(exploreBox).not.toBeNull();
  expect(contactBox).not.toBeNull();

  expect(Math.abs(exploreBox.width - contactBox.width)).toBeLessThan(2);
  expect(Math.abs(exploreBox.height - contactBox.height)).toBeLessThan(2);

  if (testInfo.project.name === 'desktop') {
    expect(Math.abs(exploreBox.y - contactBox.y)).toBeLessThan(4);
  } else {
    expect(Math.abs(exploreBox.x - contactBox.x)).toBeLessThan(2);
  }
});
