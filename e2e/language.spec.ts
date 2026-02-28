import { test, expect } from '@playwright/test';

test.describe('Language switching', () => {
  test('should switch from English to German', async ({ page }) => {
    await page.goto('/en');
    // Click the DE button in the language switcher
    await page.locator('button:has-text("DE")').first().click();
    await expect(page).toHaveURL(/\/de$/);
  });

  test('should switch from German to English', async ({ page }) => {
    await page.goto('/de');
    await page.locator('button:has-text("EN")').first().click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test('should display German homepage content', async ({ page }) => {
    await page.goto('/de');
    await expect(page.locator('h1')).toBeVisible();
    // Footer should show German copyright text
    await expect(page.locator('footer >> text=Impressum')).toBeVisible();
  });

  test('should preserve current page when switching language', async ({ page }) => {
    await page.goto('/en/impressum');
    await page.locator('button:has-text("DE")').first().click();
    await expect(page).toHaveURL(/\/de\/impressum$/);
  });
});
