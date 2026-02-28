import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage with English content by default', async ({ page }) => {
    await page.goto('/');
    // Should redirect to /en
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=myWebsite')).toBeVisible();
  });

  test('should display the header with navigation', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header >> text=Home')).toBeVisible();
    await expect(page.locator('header >> text=Members')).toBeVisible();
  });

  test('should display the footer with impressum link', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer >> text=Impressum')).toBeVisible();
  });

  test('should display hero section with feature cards', async ({ page }) => {
    await page.goto('/en');
    // Check for the 3 feature cards on the homepage
    const cards = page.locator('[class*="rounded-2xl"][class*="shadow"]');
    await expect(cards).toHaveCount(3);
  });
});
