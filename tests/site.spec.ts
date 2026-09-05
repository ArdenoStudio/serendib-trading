import { expect, test, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
  await page.route('**/api/db/analytics**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  );
};

test('static HTML shell uses the production domain', () => {
  const html = readFileSync(resolve('index.html'), 'utf8');
  expect(html).not.toMatch(/vercel\.app/);
  expect(html).toContain('https://serendibtrading.lk/');
});

const routes = [
  { path: '/', heading: /drive/i },
  { path: '/inventory', heading: /available\s+inventory/i },
  { path: '/about', heading: /driven\s+by\s+passion/i },
  { path: '/gallery', heading: /the\s+gallery/i },
  { path: '/calculator', heading: /estimate\s+payments/i },
  { path: '/contact', heading: /contact\s+serendib/i },
  { path: '/wishlist', heading: /wishlist|saved vehicles/i },
  { path: '/privacy', heading: /privacy/i },
  { path: '/terms', heading: /terms/i },
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

test('vehicle detail renders for seeded demo id', async ({ page }) => {
  await page.route('**/api/db/vehicles**', async (route) => {
    const url = new URL(route.request().url());
    const id = url.searchParams.get('id');
    if (id) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
          description: 'Demo description for e2e.',
          key_features: ['Sunroof', 'Leather Seats'],
          is_sold: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      return;
    }
    await route.fulfill({
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
    });
  });
  await page.route('**/api/db/analytics**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  );
  await page.goto('/car/test-1');
  await expect(page.locator('h1').first()).toContainText(/land cruiser prado/i);
  await expect(page.getByText(/listed price/i).first()).toBeVisible();
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

test('branded splash loader is gone', () => {
  expect(existsSync(resolve('src/components/SplashLoader.tsx'))).toBe(false);
  const loader = readFileSync(resolve('src/components/Loader.tsx'), 'utf8');
  expect(loader).not.toMatch(/ORCHESTRATING/);
  expect(loader).toContain('aria-label="Loading"');
  expect(loader).toContain('animate-spin');
});

const phoneViewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPhone SE landscape', width: 667, height: 375 },
  { name: 'Pixel 5', width: 393, height: 851 },
  { name: 'Galaxy compact', width: 360, height: 740 },
];

test('mobile nav keeps the primary CTA on-screen and does not pan the page behind', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Overlay is md:hidden');

  await stubVehicles(page);

  for (const phone of phoneViewports) {
    await page.setViewportSize({ width: phone.width, height: phone.height });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 240));
    const scrollBefore = await page.evaluate(() => window.scrollY);

    await page.getByRole('button', { name: /open menu/i }).click();
    const overlay = page.locator('#mobile-navigation');
    await expect(overlay).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/scroll-lock/);

    const cta = overlay.getByTestId('mobile-nav-primary-cta');
    await expect(cta).toBeVisible();

    const box = (await cta.boundingBox())!;
    expect(box, `${phone.name}: Get In Touch should have a box`).toBeTruthy();
    expect(box.y, `${phone.name}: CTA top stays in the viewport`).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height, `${phone.name}: CTA bottom stays in the viewport`).toBeLessThanOrEqual(phone.height + 1);
    expect(box.height, `${phone.name}: CTA is tappable`).toBeGreaterThanOrEqual(44);

    const scrollOnceLocked = await page.evaluate(() => window.scrollY);
    const nav = overlay.getByRole('navigation', { name: /mobile navigation/i });
    await nav.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await page.mouse.wheel(0, 600);
    const scrollAfterWheel = await page.evaluate(() => window.scrollY);
    expect(scrollAfterWheel, `${phone.name}: overlay pan must not move the page`).toBe(scrollOnceLocked);

    await page.getByRole('button', { name: /close menu/i }).click();
    await expect(overlay).toHaveCount(0);
    const scrollAfterClose = await page.evaluate(() => window.scrollY);
    expect(
      Math.abs(scrollAfterClose - scrollBefore),
      `${phone.name}: closing the menu restores page scroll`,
    ).toBeLessThan(2);
  }
});

test('mobile homepage View All Makes is reachable and tappable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Phone-only layout check');

  await stubVehicles(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const makes = page.getByRole('button', { name: /view all vehicle makes/i });
  await makes.scrollIntoViewIfNeeded();
  await expect(makes).toBeVisible();
  const box = (await makes.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  await makes.click();
  await expect(page).toHaveURL(/\/inventory/);
});

test('vehicle detail shows a simple spinner while loading', async ({ page }) => {
  await page.route('**/api/db/vehicles**', async (route) => {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 2_000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
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
      }),
    });
  });

  await page.goto('/car/test-1');
  await expect(page.getByRole('status', { name: 'Loading' })).toBeVisible();
  await expect(page.getByText('ORCHESTRATING EXCELLENCE')).toHaveCount(0);
});

test.describe('iOS compositor-safe homepage', () => {
  test.use({
    userAgent: devices['iPhone SE'].userAgent,
    viewport: devices['iPhone SE'].viewport,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: devices['iPhone SE'].deviceScaleFactor,
  });

  test('hero photo has no Ken Burns filters', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Run once under the mobile project');
    await stubVehicles(page);
    await page.goto('/');
    const img = page.getByTestId('hero-showroom-photo');
    await expect(img).toBeVisible();
    await expect(img).not.toHaveClass(/brightness-|contrast-|saturate-/);
  });

  test('featured arrivals scroll natively instead of a JS marquee', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Run once under the mobile project');
    await stubVehicles(page);
    await page.goto('/');
    await page.getByRole('heading', { name: /featured arrivals/i }).scrollIntoViewIfNeeded();
    const marquee = page.getByTestId('featured-arrivals-marquee');
    await expect(marquee).toBeVisible();
    await expect(marquee).toHaveCSS('overflow-x', 'auto');
  });
});

test.describe('Android and mobile homepage hero visibility', () => {
  test('hero text and heading are fully visible with opacity 1', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Run once under the mobile project');
    await stubVehicles(page);
    await page.goto('/');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/drive/i);
    const heroTextContainer = h1.locator('..');
    await expect(heroTextContainer).toHaveCSS('opacity', '1');
    await expect(page.getByRole('link', { name: /explore collection/i })).toBeVisible();
  });
});

