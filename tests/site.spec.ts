import { expect, test } from '@playwright/test';

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

      await page.goto(route.path);
      await expect(page.locator('h1').first()).toContainText(route.heading);
      await expect(page.locator('body')).not.toHaveText('');
      expect(errors).toEqual([]);
    });
  }
});

test('homepage hero CTAs stay equal-sized and aligned', async ({ page }, testInfo) => {
  await page.goto('/');

  const hero = page.locator('section').first();
  const explore = await hero.locator('a[href="/inventory"]').first().boundingBox();
  const contact = await hero.locator('a[href="/contact"]').first().boundingBox();

  expect(explore).not.toBeNull();
  expect(contact).not.toBeNull();

  const exploreBox = explore!;
  const contactBox = contact!;

  expect(Math.abs(exploreBox.width - contactBox.width)).toBeLessThan(1);
  expect(Math.abs(exploreBox.height - contactBox.height)).toBeLessThan(1);

  if (testInfo.project.name === 'desktop') {
    expect(Math.abs(exploreBox.y - contactBox.y)).toBeLessThan(1);
  } else {
    expect(Math.abs(exploreBox.x - contactBox.x)).toBeLessThan(1);
  }
});
