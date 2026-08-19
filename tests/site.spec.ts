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

test('featured arrival hover keeps a stable hit box', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Hover jitter is a fine-pointer issue');

  await stubVehicles(page);
  await page.goto('/');
  await page.getByRole('heading', { name: /featured arrivals/i }).scrollIntoViewIfNeeded();

  const marquee = page.getByTestId('featured-arrivals-marquee');
  await expect(marquee).toBeVisible();
  // Pause the ticker first so Playwright is not waiting on a moving transform.
  await marquee.hover({ position: { x: 24, y: 24 } });

  const card = page.locator('a[href="/car/test-1"]').first();
  await expect(card).toBeVisible();

  const start = (await card.boundingBox())!;
  await card.hover({
    force: true,
    position: { x: Math.max(8, start.width - 36), y: Math.max(8, start.height - 24) },
  });

  const ySamples: number[] = [];
  const hSamples: number[] = [];
  for (let i = 0; i < 8; i += 1) {
    await page.waitForTimeout(40);
    const next = (await card.boundingBox())!;
    ySamples.push(next.y);
    hSamples.push(next.height);
  }

  expect(Math.max(...ySamples) - Math.min(...ySamples)).toBeLessThan(3);
  expect(Math.max(...hSamples) - Math.min(...hSamples)).toBeLessThan(3);
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
