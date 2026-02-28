import { test, expect } from '@playwright/test';

test.describe('Auth protection', () => {
  test('should redirect unauthenticated users from members to login', async ({ page }) => {
    await page.goto('/en/members');
    // Should be redirected to login page
    await expect(page).toHaveURL(/\/en\/auth\/login/);
  });

  test('should redirect unauthenticated users from German members page', async ({ page }) => {
    await page.goto('/de/members');
    await expect(page).toHaveURL(/\/de\/auth\/login/);
  });
});

test.describe('Login form', () => {
  test('should display login form with required fields', async ({ page }) => {
    await page.goto('/en/auth/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Should stay on login page and show error
    await expect(page).toHaveURL(/\/en\/auth\/login/);
    // Wait for error message to appear
    await expect(page.locator('[class*="text-red"]')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Register form', () => {
  test('should display registration form with required fields', async ({ page }) => {
    await page.goto('/en/auth/register');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/en/auth/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    // Should show validation error (stays on page)
    await expect(page).toHaveURL(/\/en\/auth\/register/);
  });
});

test.describe('Forgot password form', () => {
  test('should display forgot password form', async ({ page }) => {
    await page.goto('/en/auth/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should submit forgot password form (shows success regardless)', async ({ page }) => {
    await page.goto('/en/auth/forgot-password');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    // Should show success message (prevents email enumeration)
    await expect(page.locator('text=Check your email')).toBeVisible({ timeout: 10_000 });
  });
});
