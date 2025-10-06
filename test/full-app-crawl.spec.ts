import { test, expect } from '@playwright/test';

test.describe('Full Application Crawl', () => {
  
  test('crawl all superadmin pages', async ({ page }) => {
    // Login as superadmin
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('superadmin@cmms.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/superadmin/, { timeout: 10000 });

    // Test Superadmin Dashboard
    await expect(page.locator('h1').filter({ hasText: /superadmin dashboard/i })).toBeVisible();
    
    // Test Module Requests
    await page.goto('/superadmin/requests');
    await page.waitForLoadState('networkidle');
    
    // Test Usage Analytics
    await page.goto('/superadmin/usage');
    await page.waitForLoadState('networkidle');
    
    // Test Expiring Licenses
    await page.goto('/superadmin/expirations');
    await page.waitForLoadState('networkidle');
    
    // Test Billing Overview
    await page.goto('/superadmin/billing');
    await page.waitForLoadState('networkidle');
  });

  test('crawl all regular user pages', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('admin@acme.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Test Dashboard
    await expect(page.locator('h1').filter({ hasText: /dashboard/i })).toBeVisible();
    
    // Test Work Orders
    await page.goto('/dashboard/work-orders');
    await page.waitForLoadState('networkidle');
    
    // Test Assets
    await page.goto('/dashboard/assets');
    await page.waitForLoadState('networkidle');
    
    // Test Users
    await page.goto('/dashboard/users');
    await page.waitForLoadState('networkidle');
    
    // Test Settings
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    
    // Test Modules
    await page.goto('/dashboard/modules');
    await page.waitForLoadState('networkidle');
  });

  test('test login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1').filter({ hasText: /welcome back/i })).toBeVisible();
  });
});
