import { test, expect } from '@playwright/test';

test.describe('Superadmin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('superadmin@cmms.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/superadmin/, { timeout: 10000 });
  });

  test('should display all dashboard cards', async ({ page }) => {
    await expect(page.getByText(/total organizations/i)).toBeVisible();
    await expect(page.getByText(/active users/i)).toBeVisible();
    await expect(page.getByText(/total modules active/i)).toBeVisible();
    await expect(page.getByText(/monthly revenue/i)).toBeVisible();
    
    // Use more specific selectors for quick action cards
    await expect(page.getByRole('heading', { name: /module requests/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /usage analytics/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /expiring licenses/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /billing overview/i })).toBeVisible();
  });

  test('should navigate to Module Requests', async ({ page }) => {
    await page.getByRole('button', { name: /view requests/i }).click();
    await expect(page).toHaveURL(/\/superadmin\/requests/);
    await expect(page.getByRole('heading', { name: /module requests/i })).toBeVisible();
  });

  test('should navigate to Usage Analytics', async ({ page }) => {
    await page.getByRole('button', { name: /view analytics/i }).click();
    await expect(page).toHaveURL(/\/superadmin\/usage/);
    await expect(page.getByRole('heading', { name: /usage monitoring/i })).toBeVisible();
  });

  test('should navigate to Billing Overview', async ({ page }) => {
    await page.getByRole('button', { name: /view billing/i }).click();
    await expect(page).toHaveURL(/\/superadmin\/billing/);
    await expect(page.getByRole('heading', { name: /billing overview/i })).toBeVisible();
  });

  test('should display organizations table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: /organizations/i })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });
});
