import { test, expect, Page } from '@playwright/test';

test.describe('Complete Module and Page Coverage Test', () => {
  let consoleErrors: string[] = [];
  let pageErrorReport: Record<string, { errors: number; warnings: number; loadTime: number }> = {};

  const setupConsoleMonitoring = (page: Page) => {
    consoleErrors = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });
  };

  test.describe('All Regular User Pages', () => {
    test.beforeEach(async ({ page }) => {
      setupConsoleMonitoring(page);
      // Login as regular user
      await page.goto('/login');
      await page.getByLabel(/email address/i).fill('admin@acme.com');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    test('should test ALL dashboard pages and modules', async ({ page }) => {
      const allPages = [
        // Core Pages
        { url: '/dashboard', name: 'Dashboard Home' },
        { url: '/dashboard/profile', name: 'User Profile' },
        { url: '/dashboard/settings', name: 'Settings' },
        
        // Asset Management
        { url: '/dashboard/assets', name: 'Assets' },
        { url: '/dashboard/assets-advanced', name: 'Assets Advanced' },
        { url: '/dashboard/asset-tracking', name: 'Asset Tracking' },
        
        // Work Management
        { url: '/dashboard/work-orders', name: 'Work Orders' },
        { url: '/dashboard/work-orders-advanced', name: 'Work Orders Advanced' },
        { url: '/dashboard/work-requests', name: 'Work Requests' },
        
        // Maintenance Modules
        { url: '/dashboard/preventive-maintenance', name: 'Preventive Maintenance' },
        { url: '/dashboard/predictive-maintenance', name: 'Predictive Maintenance' },
        { url: '/dashboard/predictive', name: 'Predictive' },
        { url: '/dashboard/pm', name: 'PM (Preventive Maintenance)' },
        
        // Inventory & Procurement
        { url: '/dashboard/inventory', name: 'Inventory' },
        { url: '/dashboard/procurement', name: 'Procurement' },
        { url: '/dashboard/vendors', name: 'Vendors' },
        
        // Reporting & Analytics
        { url: '/dashboard/reports', name: 'Reports' },
        { url: '/dashboard/advanced-reporting', name: 'Advanced Reporting' },
        { url: '/dashboard/audit', name: 'Audit' },
        
        // Scheduling & Workflows
        { url: '/dashboard/scheduling', name: 'Scheduling' },
        { url: '/dashboard/workflows', name: 'Workflows' },
        { url: '/dashboard/projects', name: 'Projects' },
        
        // Advanced Features
        { url: '/dashboard/ai-optimization', name: 'AI Optimization' },
        { url: '/dashboard/iot', name: 'IoT' },
        { url: '/dashboard/integrations', name: 'Integrations' },
        
        // Utilities & Meters
        { url: '/dashboard/meters', name: 'Meters' },
        { url: '/dashboard/energy', name: 'Energy Management' },
        { url: '/dashboard/calibration', name: 'Calibration' },
        
        // Documents & Safety
        { url: '/dashboard/documents', name: 'Documents' },
        { url: '/dashboard/safety', name: 'Safety' },
        { url: '/dashboard/failure-analysis', name: 'Failure Analysis' },
        
        // Multi-tenant & Mobile
        { url: '/dashboard/multi-tenant', name: 'Multi-Tenant' },
        { url: '/dashboard/multi-location', name: 'Multi-Location' },
        { url: '/dashboard/mobile-access', name: 'Mobile Access' },
        { url: '/dashboard/mobile-advanced', name: 'Mobile Advanced' },
        
        // Custom Fields & Modules
        { url: '/dashboard/custom-fields', name: 'Custom Fields' },
        { url: '/dashboard/modules', name: 'Modules Management' },
        
        // User Management
        { url: '/dashboard/users', name: 'Users' },
      ];

      console.log(`\n${'='.repeat(80)}`);
      console.log('COMPLETE MODULE COVERAGE TEST');
      console.log(`Testing ${allPages.length} pages`);
      console.log(`${'='.repeat(80)}\n`);

      for (const pageInfo of allPages) {
        setupConsoleMonitoring(page);
        const startTime = Date.now();
        
        try {
          await page.goto(pageInfo.url, { timeout: 15000 });
          await page.waitForLoadState('networkidle', { timeout: 10000 });
          await page.waitForTimeout(500);
          
          const loadTime = Date.now() - startTime;
          
          // Check if page loaded
          await expect(page.locator('body')).toBeVisible();
          
          // Check for locked module modal
          const modal = page.locator('[role="dialog"], .modal, [class*="modal" i]');
          const hasModal = await modal.count() > 0;
          const isLocked = hasModal && await modal.locator('text=/locked|upgrade|request/i').count() > 0;
          
          // Count interactive elements
          const buttonCount = await page.locator('button:visible').count();
          const linkCount = await page.locator('a:visible').count();
          const inputCount = await page.locator('input:visible, textarea:visible, select:visible').count();
          
          const status = isLocked ? '🔒 LOCKED' : '✅ ACCESSIBLE';
          const errorCount = consoleErrors.length;
          
          pageErrorReport[pageInfo.url] = {
            errors: errorCount,
            warnings: 0,
            loadTime: loadTime
          };
          
          console.log(`${status} | ${pageInfo.name}`);
          console.log(`   URL: ${pageInfo.url}`);
          console.log(`   Load Time: ${loadTime}ms`);
          console.log(`   Console Errors: ${errorCount}`);
          console.log(`   Interactive Elements: ${buttonCount} buttons, ${linkCount} links, ${inputCount} inputs`);
          
          if (errorCount > 0) {
            console.log(`   ⚠️  Errors: ${consoleErrors.slice(0, 2).map(e => e.substring(0, 100)).join(', ')}...`);
          }
          console.log('');
          
        } catch (error) {
          const loadTime = Date.now() - startTime;
          pageErrorReport[pageInfo.url] = {
            errors: consoleErrors.length + 1,
            warnings: 0,
            loadTime: loadTime
          };
          
          console.log(`❌ FAILED | ${pageInfo.name}`);
          console.log(`   URL: ${pageInfo.url}`);
          console.log(`   Error: ${error}`);
          console.log('');
        }
      }

      // Generate summary report
      console.log(`\n${'='.repeat(80)}`);
      console.log('TEST SUMMARY');
      console.log(`${'='.repeat(80)}`);
      
      const totalPages = allPages.length;
      const pagesWithErrors = Object.values(pageErrorReport).filter(p => p.errors > 0).length;
      const pagesWithoutErrors = totalPages - pagesWithErrors;
      const totalErrors = Object.values(pageErrorReport).reduce((sum, p) => sum + p.errors, 0);
      const avgLoadTime = Object.values(pageErrorReport).reduce((sum, p) => sum + p.loadTime, 0) / totalPages;
      
      console.log(`Total Pages Tested: ${totalPages}`);
      console.log(`Pages without errors: ${pagesWithoutErrors} (${((pagesWithoutErrors/totalPages)*100).toFixed(1)}%)`);
      console.log(`Pages with errors: ${pagesWithErrors} (${((pagesWithErrors/totalPages)*100).toFixed(1)}%)`);
      console.log(`Total Console Errors: ${totalErrors}`);
      console.log(`Average Load Time: ${avgLoadTime.toFixed(0)}ms`);
      console.log('');
      
      // List pages with most errors
      const sortedPages = Object.entries(pageErrorReport)
        .sort((a, b) => b[1].errors - a[1].errors)
        .filter(([_, data]) => data.errors > 0)
        .slice(0, 10);
      
      if (sortedPages.length > 0) {
        console.log('Top Pages with Errors:');
        sortedPages.forEach(([url, data], index) => {
          console.log(`${index + 1}. ${url} - ${data.errors} errors`);
        });
        console.log('');
      }
      
      // List slowest pages
      const slowestPages = Object.entries(pageErrorReport)
        .sort((a, b) => b[1].loadTime - a[1].loadTime)
        .slice(0, 5);
      
      console.log('Slowest Loading Pages:');
      slowestPages.forEach(([url, data], index) => {
        console.log(`${index + 1}. ${url} - ${data.loadTime}ms`);
      });
      console.log('');
      
      console.log(`${'='.repeat(80)}\n`);
    });
  });

  test.describe('All Superadmin Pages', () => {
    test.beforeEach(async ({ page }) => {
      setupConsoleMonitoring(page);
      // Login as superadmin
      await page.goto('/login');
      await page.getByLabel(/email address/i).fill('superadmin@cmms.com');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/superadmin/, { timeout: 10000 });
    });

    test('should test ALL superadmin pages', async ({ page }) => {
      const superadminPages = [
        { url: '/superadmin', name: 'Superadmin Dashboard' },
        { url: '/superadmin/organizations', name: 'Organizations Management' },
        { url: '/superadmin/requests', name: 'Module Requests' },
        { url: '/superadmin/usage', name: 'Usage Analytics' },
        { url: '/superadmin/expirations', name: 'License Expirations' },
        { url: '/superadmin/billing', name: 'Billing Overview' },
      ];

      console.log(`\n${'='.repeat(80)}`);
      console.log('SUPERADMIN PAGES TEST');
      console.log(`Testing ${superadminPages.length} pages`);
      console.log(`${'='.repeat(80)}\n`);

      for (const pageInfo of superadminPages) {
        setupConsoleMonitoring(page);
        const startTime = Date.now();
        
        try {
          await page.goto(pageInfo.url, { timeout: 15000 });
          await page.waitForLoadState('networkidle', { timeout: 10000 });
          await page.waitForTimeout(500);
          
          const loadTime = Date.now() - startTime;
          
          await expect(page.locator('body')).toBeVisible();
          
          const buttonCount = await page.locator('button:visible').count();
          const tableCount = await page.locator('table').count();
          const errorCount = consoleErrors.length;
          
          console.log(`✅ ${pageInfo.name}`);
          console.log(`   URL: ${pageInfo.url}`);
          console.log(`   Load Time: ${loadTime}ms`);
          console.log(`   Console Errors: ${errorCount}`);
          console.log(`   Elements: ${buttonCount} buttons, ${tableCount} tables`);
          console.log('');
          
        } catch (error) {
          console.log(`❌ FAILED | ${pageInfo.name}`);
          console.log(`   URL: ${pageInfo.url}`);
          console.log(`   Error: ${error}`);
          console.log('');
        }
      }

      console.log(`${'='.repeat(80)}\n`);
    });
  });

  test.describe('Form Testing on All Pages', () => {
    test.beforeEach(async ({ page }) => {
      setupConsoleMonitoring(page);
      await page.goto('/login');
      await page.getByLabel(/email address/i).fill('admin@acme.com');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    test('should find and test forms on key pages', async ({ page }) => {
      const pagesWithForms = [
        { url: '/dashboard/work-orders', name: 'Work Orders', createButton: /create|add|new/i },
        { url: '/dashboard/assets', name: 'Assets', createButton: /create|add|new/i },
        { url: '/dashboard/users', name: 'Users', createButton: /create|add|new/i },
        { url: '/dashboard/vendors', name: 'Vendors', createButton: /create|add|new/i },
        { url: '/dashboard/inventory', name: 'Inventory', createButton: /create|add|new/i },
      ];

      console.log(`\n${'='.repeat(80)}`);
      console.log('FORM INTERACTION TEST');
      console.log(`${'='.repeat(80)}\n`);

      for (const pageInfo of pagesWithForms) {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        
        console.log(`Testing forms on: ${pageInfo.name}`);
        
        // Look for create/add button
        const createButton = page.locator('button', { hasText: pageInfo.createButton }).first();
        
        if (await createButton.count() > 0) {
          await createButton.click();
          await page.waitForTimeout(1000);
          
          // Count form inputs
          const textInputs = await page.locator('input[type="text"]:visible, input:not([type]):visible').count();
          const textareas = await page.locator('textarea:visible').count();
          const selects = await page.locator('select:visible').count();
          const numberInputs = await page.locator('input[type="number"]:visible').count();
          const dateInputs = await page.locator('input[type="date"]:visible, input[type="datetime-local"]:visible').count();
          
          console.log(`   ✅ Form opened`);
          console.log(`   Fields: ${textInputs} text, ${textareas} textarea, ${selects} select, ${numberInputs} number, ${dateInputs} date`);
          
          // Try to fill first few fields
          const allInputs = page.locator('input:visible, textarea:visible').first();
          if (await allInputs.count() > 0) {
            try {
              await allInputs.fill('Test Data from Automated Test');
              console.log(`   ✅ Successfully filled test data`);
            } catch (e) {
              console.log(`   ⚠️  Could not fill field: ${e}`);
            }
          }
          
          // Look for cancel/close button
          const cancelButton = page.locator('button', { hasText: /cancel|close/i }).first();
          if (await cancelButton.count() > 0) {
            await cancelButton.click();
            await page.waitForTimeout(500);
            console.log(`   ✅ Form closed`);
          }
          
        } else {
          console.log(`   ℹ️  No create button found`);
        }
        
        console.log('');
      }

      console.log(`${'='.repeat(80)}\n`);
    });
  });
});

