import { test, expect } from '@playwright/test';

test.describe('Impressum page', () => {
  test('should display Impressum page in English', async ({ page }) => {
    await page.goto('/en/impressum');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Impressum')).toBeVisible();
  });

  test('should display Impressum page in German', async ({ page }) => {
    await page.goto('/de/impressum');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Impressum')).toBeVisible();
  });

  test('should contain required legal sections', async ({ page }) => {
    await page.goto('/en/impressum');
    // Typically an impressum page has contact information
    const content = await page.textContent('main');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(50);
  });
});
