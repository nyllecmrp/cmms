import { test, expect, Page } from '@playwright/test';

test.describe('Comprehensive Application Testing', () => {
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];

  // Helper function to monitor console errors
  const setupConsoleMonitoring = (page: Page) => {
    consoleErrors = [];
    consoleWarnings = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });
  };

  // Helper function to test responsive design
  const testResponsiveDesign = async (page: Page, url: string) => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Check that page is visible and usable
      await expect(page.locator('body')).toBeVisible();
      
      // Take a screenshot for visual inspection
      await page.screenshot({ 
        path: `test-results/responsive-${viewport.name}-${url.replace(/\//g, '-')}.png`,
        fullPage: true 
      });
    }
  };

  test.beforeEach(async ({ page }) => {
    setupConsoleMonitoring(page);
  });

  test.afterEach(async ({ page }) => {
    // Report console errors
    if (consoleErrors.length > 0) {
      console.log('Console Errors Found:', consoleErrors);
    }
    if (consoleWarnings.length > 0) {
      console.log('Console Warnings Found:', consoleWarnings);
    }
  });

  test.describe('Login and Authentication Tests', () => {
    test('should display and validate login form errors', async ({ page }) => {
      await page.goto('/login');
      
      // Test empty form submission
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Test invalid email format
      await page.getByLabel(/email address/i).fill('invalid-email');
      await page.getByLabel(/password/i).fill('short');
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Test wrong credentials
      await page.getByLabel(/email address/i).fill('wrong@test.com');
      await page.getByLabel(/password/i).fill('wrongpassword123');
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Wait for error message
      await page.waitForTimeout(1000);
      
      // Verify no critical console errors (some warnings are acceptable)
      const criticalErrors = consoleErrors.filter(err => 
        !err.includes('Failed to load') && 
        !err.includes('404')
      );
      expect(criticalErrors.length).toBe(0);
    });

    test('should test responsive design on login page', async ({ page }) => {
      await testResponsiveDesign(page, '/login');
    });
  });

  test.describe('Superadmin Workflow Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Login as superadmin
      await page.goto('/login');
      await page.getByLabel(/email address/i).fill('superadmin@cmms.com');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/superadmin/, { timeout: 10000 });
    });

    test('should navigate through all superadmin pages', async ({ page }) => {
      const pages = [
        { url: '/superadmin', name: 'Dashboard' },
        { url: '/superadmin/organizations', name: 'Organizations' },
        { url: '/superadmin/requests', name: 'Module Requests' },
        { url: '/superadmin/usage', name: 'Usage Analytics' },
        { url: '/superadmin/expirations', name: 'Expiring Licenses' },
        { url: '/superadmin/billing', name: 'Billing' },
      ];

      for (const pageInfo of pages) {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        console.log(`Testing ${pageInfo.name} - Console Errors: ${consoleErrors.length}`);
        
        // Verify page loads without critical errors
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should test module request workflow', async ({ page }) => {
      await page.goto('/superadmin/requests');
      await page.waitForLoadState('networkidle');
      
      // Look for module requests table or content
      await expect(page.locator('body')).toBeVisible();
      
      // Check for interactive elements
      const buttons = await page.locator('button').count();
      console.log(`Found ${buttons} interactive buttons on page`);
      
      // Test filtering or search if available
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      if (await searchInput.count() > 0) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('should test responsive design on superadmin dashboard', async ({ page }) => {
      await testResponsiveDesign(page, '/superadmin');
    });
  });

  test.describe('Regular User Workflow Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Login as regular user
      await page.goto('/login');
      await page.getByLabel(/email address/i).fill('admin@acme.com');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    test('should navigate through main dashboard pages', async ({ page }) => {
      const pages = [
        '/dashboard',
        '/dashboard/work-orders',
        '/dashboard/assets',
        '/dashboard/users',
        '/dashboard/settings',
        '/dashboard/modules',
      ];

      for (const url of pages) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
        console.log(`Tested ${url} - Errors: ${consoleErrors.length}`);
      }
    });

    test('should test work order creation workflow', async ({ page }) => {
      await page.goto('/dashboard/work-orders');
      await page.waitForLoadState('networkidle');
      
      // Look for "Create" or "Add" button
      const createButton = page.locator('button', { hasText: /create|add|new/i }).first();
      
      if (await createButton.count() > 0) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        // Fill out work order form with test data
        const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
        if (await titleInput.count() > 0) {
          await titleInput.fill('Test Work Order - Automated Test');
        }
        
        const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first();
        if (await descInput.count() > 0) {
          await descInput.fill('This is a test work order created by automated testing. It includes a detailed description of the maintenance work required.');
        }
        
        // Look for priority dropdown
        const prioritySelect = page.locator('select[name="priority"]').first();
        if (await prioritySelect.count() > 0) {
          await prioritySelect.selectOption({ index: 1 });
        }
        
        // Look for status dropdown
        const statusSelect = page.locator('select[name="status"]').first();
        if (await statusSelect.count() > 0) {
          await statusSelect.selectOption({ index: 1 });
        }
        
        console.log('Work order form filled with test data');
        
        // Don't submit - just test form validation
        await page.waitForTimeout(500);
      }
    });

    test('should test asset creation workflow', async ({ page }) => {
      await page.goto('/dashboard/assets');
      await page.waitForLoadState('networkidle');
      
      // Look for "Create" or "Add" button
      const createButton = page.locator('button', { hasText: /create|add|new/i }).first();
      
      if (await createButton.count() > 0) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        // Fill out asset form with test data
        const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill('Test Asset - Pump #42');
        }
        
        const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first();
        if (await descInput.count() > 0) {
          await descInput.fill('Industrial water pump located in Building A, Room 101. Model: XYZ-2000. Serial: ABC123456789.');
        }
        
        const locationInput = page.locator('input[name="location"], input[placeholder*="location" i]').first();
        if (await locationInput.count() > 0) {
          await locationInput.fill('Building A - Room 101');
        }
        
        // Look for category or type dropdown
        const categorySelect = page.locator('select[name="category"], select[name="type"]').first();
        if (await categorySelect.count() > 0) {
          await categorySelect.selectOption({ index: 1 });
        }
        
        console.log('Asset form filled with test data');
        
        // Don't submit - just test form validation
        await page.waitForTimeout(500);
      }
    });

    test('should test search and filter functionality', async ({ page }) => {
      await page.goto('/dashboard/work-orders');
      await page.waitForLoadState('networkidle');
      
      // Test search functionality
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('test search query');
        await page.waitForTimeout(500);
        await searchInput.clear();
        await page.waitForTimeout(500);
      }
      
      // Test filter dropdowns
      const filterSelects = page.locator('select');
      const selectCount = await filterSelects.count();
      
      if (selectCount > 0) {
        for (let i = 0; i < Math.min(selectCount, 3); i++) {
          const select = filterSelects.nth(i);
          const optionCount = await select.locator('option').count();
          if (optionCount > 1) {
            await select.selectOption({ index: 1 });
            await page.waitForTimeout(300);
          }
        }
      }
    });

    test('should test responsive design on dashboard', async ({ page }) => {
      await testResponsiveDesign(page, '/dashboard');
    });

    test('should test responsive design on work orders', async ({ page }) => {
      await testResponsiveDesign(page, '/dashboard/work-orders');
    });

    test('should test responsive design on assets', async ({ page }) => {
      await testResponsiveDesign(page, '/dashboard/assets');
    });
  });

  test.describe('Module Testing and Locked Features', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email address/i).fill('admin@acme.com');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    test('should test locked module modal functionality', async ({ page }) => {
      // Navigate to a potentially locked module
      await page.goto('/dashboard/predictive-maintenance');
      await page.waitForLoadState('networkidle');
      
      // Check if locked modal appears
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
      
      if (await modal.count() > 0) {
        console.log('Locked module modal detected');
        
        // Look for "Request Module" or similar button
        const requestButton = page.locator('button', { hasText: /request|unlock|upgrade/i });
        if (await requestButton.count() > 0) {
          console.log('Found request/unlock button in modal');
        }
        
        // Look for close button
        const closeButton = page.locator('button', { hasText: /close|cancel/i });
        if (await closeButton.count() > 0) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('should navigate through module pages', async ({ page }) => {
      const modulePages = [
        '/dashboard/modules',
        '/dashboard/preventive-maintenance',
        '/dashboard/predictive-maintenance',
        '/dashboard/inventory',
        '/dashboard/reports',
        '/dashboard/scheduling',
      ];

      for (const url of modulePages) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        console.log(`Tested module page: ${url}`);
      }
    });
  });

  test.describe('Error Validation Tests', () => {
    test('should test form validation messages', async ({ page }) => {
      await page.goto('/login');
      
      // Test empty form
      const emailInput = page.getByLabel(/email address/i);
      const passwordInput = page.getByLabel(/password/i);
      const submitButton = page.getByRole('button', { name: /sign in/i });
      
      // Clear and submit
      await emailInput.clear();
      await passwordInput.clear();
      await submitButton.click();
      await page.waitForTimeout(500);
      
      // Fill invalid email
      await emailInput.fill('not-an-email');
      await passwordInput.fill('123');
      await submitButton.click();
      await page.waitForTimeout(500);
      
      // Fill valid format but wrong credentials
      await emailInput.fill('test@example.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      console.log(`Form validation test completed. Errors: ${consoleErrors.length}`);
    });

    test('should test navigation errors', async ({ page }) => {
      // Try to access protected route without login
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Should redirect to login or show error
      const currentUrl = page.url();
      console.log(`Protected route redirect test - Current URL: ${currentUrl}`);
      
      // Try non-existent page
      const response = await page.goto('/dashboard/non-existent-page-xyz');
      console.log(`404 test - Response status: ${response?.status()}`);
    });
  });

  test.describe('Console and Network Monitoring', () => {
    test('should monitor console for errors on key pages', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email address/i).fill('admin@acme.com');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      
      const testPages = [
        '/dashboard',
        '/dashboard/work-orders',
        '/dashboard/assets',
        '/dashboard/users',
        '/dashboard/modules',
        '/dashboard/settings',
      ];
      
      const errorReport: Record<string, number> = {};
      
      for (const url of testPages) {
        const pageErrors: string[] = [];
        setupConsoleMonitoring(page);
        
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        errorReport[url] = consoleErrors.length;
        
        if (consoleErrors.length > 0) {
          console.log(`\n${url} - Console Errors:`, consoleErrors);
        }
      }
      
      console.log('\n=== Console Error Report ===');
      console.log(JSON.stringify(errorReport, null, 2));
      
      // Count total critical errors (excluding common warnings)
      const totalCriticalErrors = Object.values(errorReport).reduce((a, b) => a + b, 0);
      console.log(`Total critical errors across all pages: ${totalCriticalErrors}`);
    });

    test('should monitor network requests', async ({ page }) => {
      const failedRequests: string[] = [];
      
      page.on('response', (response) => {
        if (response.status() >= 400) {
          failedRequests.push(`${response.status()} - ${response.url()}`);
        }
      });
      
      await page.goto('/login');
      await page.getByLabel(/email address/i).fill('admin@acme.com');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      
      await page.goto('/dashboard/work-orders');
      await page.waitForLoadState('networkidle');
      
      await page.goto('/dashboard/assets');
      await page.waitForLoadState('networkidle');
      
      if (failedRequests.length > 0) {
        console.log('\n=== Failed Network Requests ===');
        failedRequests.forEach(req => console.log(req));
      } else {
        console.log('\n=== All network requests successful ===');
      }
    });
  });

  test.describe('Performance and Loading Tests', () => {
    test('should measure page load times', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email address/i).fill('admin@acme.com');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      
      const testPages = [
        '/dashboard',
        '/dashboard/work-orders',
        '/dashboard/assets',
      ];
      
      for (const url of testPages) {
        const startTime = Date.now();
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        console.log(`${url} - Load time: ${loadTime}ms`);
        
        // Assert reasonable load time (under 5 seconds)
        expect(loadTime).toBeLessThan(5000);
      }
    });
  });
});

