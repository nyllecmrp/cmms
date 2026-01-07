# Phase 2 & 3 Testing Checklist

## Pre-Testing Setup

### Database Migration
```bash
cd backend
sqlite3 dev.db < database/migrations/002_add_phase2_phase3_tables.sql
```

### Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Phase 2: Enforcement - Testing Checklist

### ✅ 1. API-Level Module Checks

**Backend Tests:**
- [ ] Test module guard on protected endpoints
- [ ] Verify core modules are always accessible
- [ ] Test non-core module access with valid license
- [ ] Test non-core module access without license (should return 403)
- [ ] Test superadmin bypass (should access all modules)
- [ ] Verify API call tracking in `ModuleUsageTracking` table

**Test Endpoints:**
```bash
# Test with licensed module
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/assets?organizationId=<org_id>

# Test with unlicensed module
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/preventive-maintenance?organizationId=<org_id>
```

### ✅ 2. Frontend Route Guards

**Frontend Tests:**
- [ ] Navigate to licensed module page (should load)
- [ ] Navigate to unlicensed module page (should show locked screen)
- [ ] Verify `ModuleGuard` component displays module info
- [ ] Test trial request from locked screen
- [ ] Test purchase request from locked screen
- [ ] Verify module features list displays correctly

**Test URLs:**
```
http://localhost:3000/dashboard/assets (core - should work)
http://localhost:3000/dashboard/preventive-maintenance (check if licensed)
http://localhost:3000/dashboard/procurement (check if licensed)
```

### ✅ 3. Grace Period Logic

**Test Cases:**
- [ ] Create module license with past expiration date
- [ ] Verify GET requests work (read-only)
- [ ] Verify POST/PUT/DELETE requests blocked with grace period message
- [ ] Check yellow banner displays on frontend
- [ ] Test grace period ends after 7 days (auto-expire)

**SQL Test Setup:**
```sql
-- Create expired license (5 days ago)
INSERT INTO ModuleLicense (
  id, organizationId, moduleCode, status, expiresAt, createdAt, updatedAt
) VALUES (
  'test-license-id', '<org-id>', 'preventive_maintenance', 'active',
  datetime('now', '-5 days'), datetime('now'), datetime('now')
);
```

### ✅ 4. Data Archival System

**Test Cases:**
- [ ] Archive data for expired module
- [ ] Verify data stored in `DataArchive` table
- [ ] Restore archived data when module reactivated
- [ ] Export archived data (JSON format)
- [ ] Check storage size calculation
- [ ] Test auto-deletion after 90 days

**API Tests:**
```bash
# Archive module data
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"<org-id>","moduleCode":"preventive_maintenance"}' \
  http://localhost:3001/api/module-licensing/archive

# Get archived data
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/module-licensing/organization/<org-id>/archives

# Restore data
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"<org-id>","moduleCode":"preventive_maintenance"}' \
  http://localhost:3001/api/module-licensing/restore
```

### ✅ 5. Usage Tracking

**Test Cases:**
- [ ] Verify API calls increment in database
- [ ] Check daily aggregation (same day updates existing record)
- [ ] Test usage stats endpoint
- [ ] Verify tracking doesn't fail requests if error occurs

**Check Database:**
```sql
SELECT * FROM ModuleUsageTracking
WHERE organizationId = '<org-id>'
ORDER BY date DESC;
```

---

## Phase 3: User Experience - Testing Checklist

### ✅ 1. Locked Module Screens

**Component Tests (`LockedModuleModal`):**
- [ ] Click locked module in sidebar
- [ ] Verify modal displays module info correctly
- [ ] Check feature list renders
- [ ] Test tier badge displays
- [ ] Click "Start 30-Day Trial" button
- [ ] Enter justification and submit
- [ ] Verify success confirmation shows
- [ ] Test "Upgrade Plan" flow

**Visual Checks:**
- [ ] Modal responsive on mobile
- [ ] Icons render correctly
- [ ] Gradient colors display properly
- [ ] Close button works

### ✅ 2. In-App Upgrade Flows

**Component Tests (`UpgradeFlow`):**
- [ ] Open upgrade modal from dashboard
- [ ] Verify all 4 tiers display
- [ ] Check "Most Popular" badge on Professional
- [ ] Adjust user count slider
- [ ] Verify price calculation updates live
- [ ] Test tier selection
- [ ] Submit upgrade request
- [ ] Verify success message

**Price Calculation Tests:**
```
Starter (10 users): ₱3,500 + (10 × ₱250) = ₱6,000/month
Professional (25 users): ₱8,000 + (25 × ₱400) = ₱18,000/month
Enterprise (50 users): ₱15,000 + (50 × ₱600) = ₱45,000/month
```

### ✅ 3. Trial Activation System

**Component Tests (`TrialActivation`):**

**Button Variant:**
- [ ] Click "Start 30-Day Trial" button
- [ ] Verify loading spinner
- [ ] Check success checkmark
- [ ] Verify page refreshes after 2 seconds

**Card Variant:**
- [ ] Verify card displays benefits list
- [ ] Test activation button
- [ ] Check success state animation

**Banner Variant:**
- [ ] Verify gradient background
- [ ] Test compact button layout
- [ ] Check responsive design

**API Integration:**
```bash
# Should call this endpoint
POST /api/module-licensing/start-trial
{
  "organizationId": "<org-id>",
  "moduleCode": "preventive_maintenance",
  "userId": "<user-id>",
  "days": 30
}
```

### ✅ 4. Notification System

**Backend Tests:**
- [ ] Create notification via API
- [ ] Fetch user notifications
- [ ] Get unread count
- [ ] Mark notification as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Test auto-polling (60 seconds)

**Frontend Tests (`NotificationBell`):**
- [ ] Verify bell icon in header
- [ ] Check unread badge displays count
- [ ] Click bell to open dropdown
- [ ] Verify notifications list loads
- [ ] Test notification type icons (success, warning, error, info)
- [ ] Click "Mark all read" button
- [ ] Delete individual notification
- [ ] Click notification link (navigates correctly)
- [ ] Check time ago formatting

**Notification Types to Test:**
- [ ] Module expiring soon (30, 14, 7 days)
- [ ] Module expired (grace period)
- [ ] Trial activated
- [ ] Trial ending soon
- [ ] Module activated

### ✅ 5. Billing Integration

**API Tests:**
```bash
# Calculate pricing
GET /api/billing/calculate-price?tier=professional&userCount=25&billingCycle=monthly

# Create subscription
POST /api/billing/subscriptions
{
  "organizationId": "<org-id>",
  "tier": "professional",
  "userCount": 25,
  "billingCycle": "monthly",
  "paymentMethod": "gcash"
}

# Get active subscription
GET /api/billing/organizations/<org-id>/subscription

# Get payment history
GET /api/billing/organizations/<org-id>/payments
```

**Database Verification:**
```sql
-- Check subscriptions
SELECT * FROM Subscription WHERE organizationId = '<org-id>';

-- Check payments
SELECT * FROM Payment WHERE organizationId = '<org-id>';

-- Check invoices
SELECT * FROM Invoice WHERE organizationId = '<org-id>';
```

---

## Integration Tests

### End-to-End Workflow 1: Trial to Activation
1. [ ] User clicks locked module
2. [ ] Selects "Start Trial"
3. [ ] Trial activates (30 days)
4. [ ] Notification created
5. [ ] Module becomes accessible
6. [ ] Usage tracked
7. [ ] Trial expiration reminder (7 days before)
8. [ ] Trial expires
9. [ ] Grace period activates
10. [ ] Purchase to activate full license

### End-to-End Workflow 2: Direct Purchase
1. [ ] User clicks "Upgrade Plan"
2. [ ] Selects tier and user count
3. [ ] Submits upgrade request
4. [ ] Superadmin approves
5. [ ] Modules activate
6. [ ] Notification sent
7. [ ] User accesses new modules
8. [ ] Usage tracked

### End-to-End Workflow 3: Expiration Handling
1. [ ] Module expires
2. [ ] Notification sent (30 days before)
3. [ ] Second notification (14 days)
4. [ ] Third notification (7 days)
5. [ ] Module expires
6. [ ] Grace period starts (read-only)
7. [ ] Grace period notification
8. [ ] After 7 days, module fully locked
9. [ ] Data archived
10. [ ] Renewal reactivates + restores data

---

## Performance Tests

- [ ] Module access check latency < 100ms
- [ ] Notification loading < 500ms
- [ ] Trial activation < 2 seconds
- [ ] Usage tracking doesn't slow requests
- [ ] Archival process completes < 5 seconds per 1000 records

---

## Security Tests

- [ ] Non-authenticated users blocked from all module endpoints
- [ ] Users can't access other organization's modules
- [ ] Module guards work with expired tokens
- [ ] SQL injection attempts blocked in module queries
- [ ] XSS attempts sanitized in notifications

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## Common Issues & Fixes

### Issue 1: Module guard not working
**Fix:** Ensure `CommonModule` is imported in `app.module.ts`

### Issue 2: Notifications not loading
**Fix:** Check JWT token validity and `/notifications` endpoint

### Issue 3: Trial activation fails
**Fix:** Verify `ModuleLicense` table has correct schema

### Issue 4: Grace period not working
**Fix:** Check date calculations in `checkGracePeriod()` method

### Issue 5: API calls not tracked
**Fix:** Verify `trackModuleUsage()` is called in guard

---

## Post-Testing Cleanup

```sql
-- Reset test data
DELETE FROM ModuleLicense WHERE organizationId = '<test-org-id>';
DELETE FROM ModuleUsageTracking WHERE organizationId = '<test-org-id>';
DELETE FROM DataArchive WHERE organizationId = '<test-org-id>';
DELETE FROM Notification WHERE userId IN (SELECT id FROM User WHERE organizationId = '<test-org-id>');
DELETE FROM Subscription WHERE organizationId = '<test-org-id>';
DELETE FROM Payment WHERE organizationId = '<test-org-id>';
```

---

## Sign-off

- [ ] All Phase 2 tests passed
- [ ] All Phase 3 tests passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Database migrations successful
- [ ] Documentation updated
- [ ] Ready for production deployment

**Tested By:** _________________
**Date:** _________________
**Version:** Phase 2 & 3 Complete
