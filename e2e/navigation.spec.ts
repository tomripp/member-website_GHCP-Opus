import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to impressum page', async ({ page }) => {
    await page.goto('/en');
    await page.locator('footer >> text=Impressum').click();
    await expect(page).toHaveURL(/\/en\/impressum$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/en');
    await page.locator('header >> text=Login').click();
    await expect(page).toHaveURL(/\/en\/auth\/login$/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/en');
    await page.locator('header >> text=Register').click();
    await expect(page).toHaveURL(/\/en\/auth\/register$/);
  });

  test('should navigate from login to forgot password', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.locator('text=Forgot your password').click();
    await expect(page).toHaveURL(/\/en\/auth\/forgot-password$/);
  });

  test('should navigate from login to register', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.locator("text=Don't have an account").click();
    await expect(page).toHaveURL(/\/en\/auth\/register$/);
  });

  test('should navigate from register to login', async ({ page }) => {
    await page.goto('/en/auth/register');
    await page.locator('text=Already have an account').click();
    await expect(page).toHaveURL(/\/en\/auth\/login$/);
  });
});
