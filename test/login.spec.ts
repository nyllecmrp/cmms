import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register here/i })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.getByLabel(/email address/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully as superadmin', async ({ page }) => {
    await page.getByLabel(/email address/i).fill('superadmin@cmms.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/superadmin/, { timeout: 10000 });
    await expect(page.getByText(/superadmin dashboard/i)).toBeVisible();
  });

  test('should login successfully as regular user', async ({ page }) => {
    await page.getByLabel(/email address/i).fill('admin@acme.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /register here/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});
