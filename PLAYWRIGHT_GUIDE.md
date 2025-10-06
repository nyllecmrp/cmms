# Playwright Testing Guide for CMMS

## 📚 Overview

Playwright is configured for end-to-end testing of your CMMS application. It tests the app in real browsers (Chromium, Firefox, WebKit) to ensure everything works correctly.

---

## 🚀 Quick Start

### 1. **Prerequisites**

Make sure your backend and frontend are running:

```bash
# Terminal 1: Start backend
cd backend
npm run start:dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Or use the combined command:

```bash
npm run dev
```

### 2. **Run Tests**

```bash
# Run all tests (headless mode)
npm test

# Run tests in UI mode (interactive, recommended for development)
npm run test:ui

# Run tests with browser visible (headed mode)
npm run test:headed

# Show test report after running tests
npm run test:report
```

---

## 📁 Test Files Created

### **1. `test/login.spec.ts`** - Login Flow Tests
- ✅ Display login page correctly
- ✅ Show error with invalid credentials
- ✅ Login successfully as superadmin
- ✅ Login successfully as regular user
- ✅ Navigate to register page

### **2. `test/superadmin.spec.ts`** - Superadmin Dashboard Tests
- ✅ Display all dashboard cards
- ✅ Navigate to Module Requests
- ✅ Navigate to Usage Analytics
- ✅ Navigate to Expiring Licenses
- ✅ Navigate to Billing Overview
- ✅ Display organizations table
- ✅ Navigate to organization module management
- ✅ Logout successfully

### **3. `test/module-activation.spec.ts`** - Module Management Tests
- ✅ Activate a module for organization
- ✅ Deactivate an active module
- ✅ Filter modules by status

---

## 🎯 Common Commands

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test test/login.spec.ts

# Run tests matching a pattern
npx playwright test login

# Run a specific test by name
npx playwright test -g "should login successfully"
```

### Running in Different Browsers

```bash
# Run in Chromium only
npx playwright test --project=chromium

# Run in Firefox only
npx playwright test --project=firefox

# Run in WebKit (Safari) only
npx playwright test --project=webkit
```

### Debugging Tests

```bash
# Run in debug mode (step through tests)
npx playwright test --debug

# Run in UI mode (best for debugging)
npm run test:ui

# Generate and show trace viewer (for failed tests)
npx playwright show-trace trace.zip
```

### Test Reports

```bash
# Show last test report
npm run test:report

# The report is automatically generated in playwright-report/
```

---

## ✍️ Writing Your Own Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  // Run before each test in this describe block
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Your test code here
    await page.getByRole('button', { name: /click me/i }).click();
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});
```

### Common Playwright Actions

```typescript
// Navigation
await page.goto('http://localhost:3000/login');
await page.goto('/dashboard'); // Uses baseURL

// Finding elements
await page.getByRole('button', { name: /submit/i }); // By role and name
await page.getByPlaceholder(/email/i); // By placeholder
await page.getByText(/hello world/i); // By text content
await page.getByLabel(/username/i); // By label
await page.locator('.css-class'); // By CSS selector

// Interactions
await page.click('button');
await page.fill('input', 'text value');
await page.check('checkbox');
await page.selectOption('select', 'option value');

// Assertions
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveTitle(/Dashboard/);
await expect(element).toBeVisible();
await expect(element).toHaveText('Expected text');
await expect(element).toBeEnabled();
```

### Testing Login Flow

```typescript
test('login as admin', async ({ page }) => {
  await page.goto('/login');

  // Fill credentials
  await page.getByPlaceholder(/email/i).fill('admin@acme.com');
  await page.getByPlaceholder(/password/i).fill('Admin123!');

  // Submit
  await page.getByRole('button', { name: /sign in/i }).click();

  // Verify redirect
  await expect(page).toHaveURL(/\/dashboard/);
});
```

### Testing with Authentication

```typescript
test.describe('Protected Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('can access protected page', async ({ page }) => {
    await page.goto('/protected');
    await expect(page.getByText(/protected content/i)).toBeVisible();
  });
});
```

---

## 🎨 Best Practices

### 1. **Use Semantic Selectors**
✅ Good: `page.getByRole('button', { name: /submit/i })`
❌ Avoid: `page.locator('#submit-btn-123')`

### 2. **Wait for Elements**
```typescript
// Good - Playwright auto-waits
await expect(page.getByText(/success/i)).toBeVisible();

// Avoid explicit waits unless necessary
await page.waitForTimeout(1000); // ❌ Flaky
```

### 3. **Use Test Isolation**
```typescript
// Each test should be independent
test.beforeEach(async ({ page }) => {
  // Reset state before each test
  await page.goto('/login');
  // Login, etc.
});
```

### 4. **Use Descriptive Test Names**
```typescript
✅ test('should display error when email is invalid', ...)
❌ test('test 1', ...)
```

### 5. **Group Related Tests**
```typescript
test.describe('User Registration', () => {
  test('should validate email format', ...);
  test('should require password', ...);
  test('should confirm password match', ...);
});
```

---

## 🐛 Troubleshooting

### Tests Timing Out

```bash
# Increase timeout in playwright.config.ts
{
  use: {
    actionTimeout: 30000, // 30 seconds
    navigationTimeout: 60000, // 60 seconds
  }
}
```

### Server Not Running

Make sure both backend (port 3001) and frontend (port 3000) are running before tests.

### Browser Installation

If browsers aren't installed:

```bash
npx playwright install
```

### Screenshots on Failure

Playwright automatically takes screenshots on test failures. Find them in `test-results/`.

### View Test Traces

```bash
# Traces are captured on first retry
npx playwright show-trace test-results/path-to-trace.zip
```

---

## 📊 CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm test

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

---

## 🔗 Useful Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)

---

## 📝 Example: Complete Test Flow

```typescript
import { test, expect } from '@playwright/test';

test.describe('Module Purchase Flow', () => {
  test('user can request and activate a module', async ({ page }) => {
    // 1. Login as regular user
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@acme.com');
    await page.getByPlaceholder(/password/i).fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navigate to modules
    await page.getByRole('link', { name: /modules/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/modules/);

    // 3. Request a module
    await page.getByRole('button', { name: /request purchase/i }).first().click();
    await expect(page.getByText(/request submitted/i)).toBeVisible();

    // 4. Logout
    await page.getByRole('button', { name: /logout/i }).click();

    // 5. Login as superadmin
    await page.getByPlaceholder(/email/i).fill('superadmin@cmms.com');
    await page.getByPlaceholder(/password/i).fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/superadmin/);

    // 6. Approve request
    await page.getByRole('button', { name: /view requests/i }).click();
    await page.getByRole('button', { name: /approve/i }).first().click();
    await expect(page.getByText(/approved/i)).toBeVisible();

    // 7. Verify module is active
    await page.goto('/superadmin');
    await page.getByRole('button', { name: /manage modules/i }).first().click();
    await expect(page.getByRole('button', { name: /deactivate/i })).toBeVisible();
  });
});
```

---

## 🎓 Next Steps

1. Run the example tests: `npm run test:ui`
2. Write tests for your specific features
3. Add tests to your development workflow
4. Set up CI/CD to run tests automatically

Happy Testing! 🚀
