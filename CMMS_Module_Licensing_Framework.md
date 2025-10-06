# CMMS Module Licensing & Access Control Framework

**Document Version:** 1.0  
**Date:** October 2, 2025

---

## 1. Overview

This document outlines the modular architecture and licensing framework for the CMMS application, enabling superadmin-controlled module activation based on customer subscription tiers, organizational needs, or industry requirements.

---

## 2. Module Tier Classification

### 2.1 Core Modules (Always Enabled)
These modules form the foundation of the CMMS and are included in all deployments:

| Module | Description | Justification |
|--------|-------------|---------------|
| **User Management & Administration** | User accounts, roles, permissions | Essential for system operation |
| **Asset Management (Basic)** | Asset registry, basic tracking | Core CMMS functionality |
| **Work Order Management (Basic)** | Create, assign, complete work orders | Core CMMS functionality |
| **Mobile Application (Basic)** | View work orders, update status | Modern CMMS requirement |
| **Basic Reporting** | Standard reports, basic dashboards | Essential for visibility |

**Features within Core Modules:**
- User authentication and RBAC
- Basic asset profiles with photos
- Simple work order lifecycle
- Mobile app with online-only mode
- Pre-built report templates (5-10 standard reports)

---

### 2.2 Standard Modules (Tier 1 - Professional)
Modules for organizations ready to expand beyond basic maintenance management:

| Module | Description | Typical Users |
|--------|-------------|---------------|
| **Preventive Maintenance** | Scheduled maintenance, PM compliance | Growing maintenance departments |
| **Inventory Management** | Parts tracking, stock levels | Organizations managing spare parts |
| **Scheduling & Planning** | Calendar views, resource allocation | Teams coordinating multiple technicians |
| **Asset Management (Advanced)** | Asset hierarchy, criticality, genealogy | Organizations with complex assets |
| **Work Order Management (Advanced)** | Approval workflows, templates, SLA | Organizations needing process control |
| **Document Management** | Centralized document repository | Compliance-focused organizations |
| **Meter Reading** | Usage-based maintenance triggers | Equipment with measurable usage |

**Additional Features Unlocked:**
- PM auto-generation and templates
- Multi-location inventory
- Drag-and-drop scheduling
- Asset parent-child relationships
- Work order approval workflows
- Document version control
- Meter-based PM triggers

---

### 2.3 Advanced Modules (Tier 2 - Enterprise)
Comprehensive modules for sophisticated maintenance operations:

| Module | Description | Typical Users |
|--------|-------------|---------------|
| **Predictive Maintenance** | IoT integration, condition monitoring | Large enterprises with critical assets |
| **Purchasing & Procurement** | PO management, vendor contracts | Organizations with formal procurement |
| **Advanced Analytics & BI** | Custom dashboards, KPI tracking | Data-driven organizations |
| **Safety & Compliance** | LOTO, permits, incident tracking | Regulated industries |
| **Calibration Management** | Instrument calibration tracking | Labs, healthcare, manufacturing |
| **Failure Analysis** | RCA, FMEA tools | Continuous improvement focus |
| **Project Management** | Large maintenance projects | Capital project management |
| **Energy Management** | Utility tracking, sustainability | Energy-intensive operations |
| **Mobile Application (Advanced)** | Offline mode, voice-to-text, navigation | Field-heavy organizations |

**Additional Features Unlocked:**
- IoT sensor integration and analytics
- ML-based failure prediction
- Purchase requisition workflows
- Custom report builder
- LOTO digital workflows
- Calibration certificate management
- RCA templates and tracking
- Project Gantt charts
- Utility consumption dashboards
- Mobile offline sync

---

### 2.4 Premium Modules (Tier 3 - Enterprise Plus)
Specialized modules for specific industries or advanced needs:

| Module | Description | Typical Users |
|--------|-------------|---------------|
| **Vendor Management** | Vendor scorecards, performance tracking | Organizations with many contractors |
| **Audit & Quality** | Audit management, CAPA tracking | Heavily regulated industries |
| **Integration Hub & API** | Pre-built integrations, custom API access | Enterprises with existing systems |
| **Multi-tenancy Management** | Manage multiple organizations | Service providers, franchises |
| **Advanced Workflow Engine** | Custom approval chains, automation rules | Complex organizational structures |
| **AI-Powered Optimization** | Schedule optimization, predictive insights | Cutting-edge operations |

**Additional Features Unlocked:**
- Vendor certification tracking
- Audit scheduling and findings
- ERP/EAM integrations
- White-label multi-tenant deployment
- Visual workflow builder
- AI schedule recommendations

---

## 3. Philippine Market Pricing Tiers

### Tier Structure (PHP Pricing)

| Tier | Modules Included | Monthly Price (PHP) | Annual Price (PHP) | Target Customer |
|------|------------------|---------------------|-------------------|-----------------|
| **Starter** | Core Modules Only | ₱3,500 base + ₱250/user | ₱35,000 base + ₱2,500/user | Small businesses (1-10 users) |
| **Professional** | Core + Standard Modules | ₱8,000 base + ₱400/user | ₱80,000 base + ₱4,000/user | Growing operations (10-50 users) |
| **Enterprise** | Core + Standard + Advanced | ₱15,000 base + ₱600/user | ₱150,000 base + ₱6,000/user | Large organizations (50-200 users) |
| **Enterprise Plus** | All Modules | Custom pricing (₱25,000+ base) | Custom pricing | Complex enterprises (200+ users) |

**Pricing Philosophy:**
- Hybrid model: Base platform fee + per-user pricing
- Lower barrier to entry for Philippine SMEs
- Volume discounts for annual subscriptions (save ~17%)
- Minimum 3 users required per subscription

### Pricing Examples:

**Starter Tier:**
- 5 users: ₱3,500 + (5 × ₱250) = **₱4,750/month** or **₱47,500/year**
- 10 users: ₱3,500 + (10 × ₱250) = **₱6,000/month** or **₱60,000/year**

**Professional Tier:**
- 10 users: ₱8,000 + (10 × ₱400) = **₱12,000/month** or **₱120,000/year**
- 25 users: ₱8,000 + (25 × ₱400) = **₱18,000/month** or **₱180,000/year**

**Enterprise Tier:**
- 50 users: ₱15,000 + (50 × ₱600) = **₱45,000/month** or **₱450,000/year**
- 100 users: ₱15,000 + (100 × ₱600) = **₱75,000/month** or **₱750,000/year**

### À La Carte Module Add-ons
Organizations can purchase individual modules outside their tier:

| Module Type | Monthly Add-on Price (PHP) | Annual Add-on Price (PHP) |
|-------------|---------------------------|--------------------------|
| Standard Module | ₱3,000 - ₱8,000 per module | ₱30,000 - ₱80,000 per module |
| Advanced Module | ₱8,000 - ₱15,000 per module | ₱80,000 - ₱150,000 per module |
| Premium Module | ₱15,000 - ₱30,000 per module | ₱150,000 - ₱300,000 per module |

### Educational & Non-Profit Discount
- **30% discount** for schools, universities, hospitals, and registered non-profit organizations
- **50% discount** for first 6 months (pilot program)

### Government Pricing
- Custom pricing with flexible payment terms
- Annual or multi-year contracts preferred
- Bulk licensing available for government agencies

---

## 4. Industry-Specific Packages

Pre-configured module bundles optimized for specific industries:

### 4.1 Manufacturing Package
**Core + Included Modules:**
- Preventive Maintenance ✓
- Predictive Maintenance ✓
- Inventory Management ✓
- Energy Management ✓
- Scheduling & Planning ✓
- Safety & Compliance ✓

**Philippine Market Pricing:**
- **₱12,000/month base + ₱500/user** (10-50 users)
- **₱18,000/month base + ₱450/user** (51-100 users)
- Target: Food processing, electronics, automotive parts manufacturers

### 4.2 Healthcare Package
**Core + Included Modules:**
- Preventive Maintenance ✓
- Calibration Management ✓
- Safety & Compliance ✓
- Document Management ✓
- Audit & Quality ✓

**Philippine Market Pricing:**
- **₱10,000/month base + ₱450/user** (10-50 users)
- **₱15,000/month base + ₱400/user** (51-100 users)
- 30% discount for public hospitals and DOH facilities
- Target: Hospitals, clinics, medical laboratories

### 4.3 Facilities Management Package
**Core + Included Modules:**
- Preventive Maintenance ✓
- Energy Management ✓
- Project Management ✓
- Vendor Management ✓
- Scheduling & Planning ✓

**Philippine Market Pricing:**
- **₱9,000/month base + ₱400/user** (10-50 users)
- **₱14,000/month base + ₱350/user** (51-100 users)
- Target: BPOs, malls, condominiums, office buildings, property management

### 4.4 Fleet Management Package
**Core + Included Modules:**
- Preventive Maintenance ✓
- Meter Reading ✓
- Mobile Application (Advanced) ✓
- Fuel & Telematics Integration ✓
- Inventory Management ✓

**Philippine Market Pricing:**
- **₱8,000/month base + ₱350/user** (10-50 users)
- **₱12,000/month base + ₱300/user** (51-100 users)
- Target: Logistics companies, bus operators, rental fleets, LGU motor pools

### 4.5 Hospitality Package
**Core + Included Modules:**
- Preventive Maintenance ✓
- Work Request Portal ✓
- Scheduling & Planning ✓
- Vendor Management ✓
- Guest-Facing Features ✓

**Philippine Market Pricing:**
- **₱7,500/month base + ₱350/user** (5-30 users)
- **₱11,000/month base + ₱300/user** (31-100 users)
- Target: Hotels, resorts, restaurants, event venues

---

## 5. Superadmin Module Management

### 5.1 Superadmin Dashboard

**Module Management Interface:**
```
┌─────────────────────────────────────────────────────┐
│  Organization: Acme Manufacturing                    │
│  Current Tier: Enterprise                            │
│  License Valid Until: Oct 2, 2026                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MODULE MANAGEMENT                                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ☑ Core Modules                    [Always Active]  │
│  ☑ Preventive Maintenance         [Active]          │
│  ☑ Inventory Management           [Active]          │
│  ☐ Predictive Maintenance         [Locked]  [UNLOCK]│
│  ☑ Safety & Compliance            [Active]          │
│  ☐ Calibration Management         [Locked]  [UNLOCK]│
│  ☐ Energy Management              [Locked]  [UNLOCK]│
│  ☑ Advanced Mobile                [Active]          │
│  ☐ Integration Hub                [Locked]  [UNLOCK]│
│                                                      │
│  [View Usage Analytics]  [License History]          │
└─────────────────────────────────────────────────────┘
```

### 5.2 Superadmin Capabilities

**Module Activation/Deactivation:**
- Enable/disable modules per organization
- Set activation dates and expiration
- Configure trial periods (e.g., 30-day free trial)
- Soft vs. hard deactivation options

**License Management:**
- Assign user licenses per module
- Set concurrent user limits
- Configure usage caps (e.g., max work orders per month)
- Monitor license utilization

**Feature Flags:**
- Enable/disable specific features within modules
- A/B testing of new features
- Gradual rollout control
- Emergency feature kill switch

**Access Control:**
- Define which organizational roles can access modules
- Set permission levels per module
- Create custom access packages
- Override standard tier restrictions

**Audit & Compliance:**
- Track all module activation/deactivation events
- Monitor unauthorized access attempts
- Generate licensing compliance reports
- Export audit logs

### 5.3 Module Activation Process

**Workflow:**
```
1. Customer requests module activation
   ↓
2. Superadmin reviews request in admin portal
   ↓
3. Superadmin verifies:
   - License tier allows module
   - Payment/subscription status current
   - User limit not exceeded
   ↓
4. Superadmin activates module
   ↓
5. System sends notification to customer admin
   ↓
6. Module appears in customer's interface
   ↓
7. Customer admin configures module settings
   ↓
8. Module available to authorized users
```

**Activation Options:**
- **Instant Activation:** Module available immediately
- **Scheduled Activation:** Activate on specific date
- **Trial Activation:** 30/60/90-day trial with auto-conversion
- **Conditional Activation:** Based on usage thresholds

### 5.4 Deactivation & Grace Periods

**Deactivation Scenarios:**
1. **Subscription Expiration**
   - 7-day grace period
   - Read-only access to data
   - Export functionality available
   - Re-activation restores full access

2. **Downgrade Request**
   - 30-day transition period
   - Data migration assistance
   - Archived data retention

3. **Non-Payment**
   - 14-day grace period
   - Warning notifications
   - Soft lock (read-only)
   - Hard lock after grace period

4. **Manual Deactivation**
   - Immediate or scheduled
   - Data export before deactivation
   - Optional data retention period

**Data Handling:**
- Data created in locked modules remains accessible in read-only mode
- Export functionality always available
- Configurable data retention policy (90 days to indefinite)
- Automatic archival of inactive module data

---

## 6. Technical Implementation

### 6.1 Database Schema

**Module Licensing Table:**
```sql
CREATE TABLE module_licenses (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    module_code VARCHAR(50),
    tier_level VARCHAR(20),
    status VARCHAR(20), -- active, inactive, trial, expired
    activated_at TIMESTAMP,
    expires_at TIMESTAMP,
    activated_by UUID REFERENCES users(id),
    license_key VARCHAR(255),
    max_users INTEGER,
    usage_limits JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE module_usage_tracking (
    id UUID PRIMARY KEY,
    organization_id UUID,
    module_code VARCHAR(50),
    date DATE,
    active_users INTEGER,
    transactions INTEGER,
    api_calls INTEGER,
    storage_used BIGINT,
    created_at TIMESTAMP
);

CREATE TABLE module_access_log (
    id UUID PRIMARY KEY,
    organization_id UUID,
    user_id UUID,
    module_code VARCHAR(50),
    action VARCHAR(50), -- activated, deactivated, accessed, denied
    ip_address INET,
    timestamp TIMESTAMP
);
```

### 6.2 Backend Module Guard

**Middleware Example (Node.js/Express):**
```javascript
const moduleGuard = (requiredModule) => {
  return async (req, res, next) => {
    const { organizationId, userId } = req.user;
    
    // Check if module is licensed and active
    const license = await ModuleLicense.findOne({
      organization_id: organizationId,
      module_code: requiredModule,
      status: 'active',
      expires_at: { $gt: new Date() }
    });
    
    if (!license) {
      await logAccessAttempt(organizationId, userId, requiredModule, 'denied');
      return res.status(403).json({
        error: 'Module not licensed',
        message: `The ${requiredModule} module is not available in your current plan.`,
        upgrade_url: '/pricing',
        contact_sales: true
      });
    }
    
    // Check user limits
    if (license.max_users) {
      const activeUsers = await getActiveModuleUsers(organizationId, requiredModule);
      if (activeUsers >= license.max_users) {
        return res.status(403).json({
          error: 'User limit reached',
          message: 'Maximum concurrent users for this module exceeded.'
        });
      }
    }
    
    await logAccessAttempt(organizationId, userId, requiredModule, 'accessed');
    next();
  };
};

// Usage in routes
app.get('/api/predictive-maintenance/*', 
  authenticate, 
  moduleGuard('predictive_maintenance'), 
  predictiveMaintenanceController
);
```

### 6.3 Frontend Module Visibility

**React Component Example:**
```jsx
import { useModuleAccess } from '@/hooks/useModuleAccess';

const Navigation = () => {
  const { hasModule, isLoading } = useModuleAccess();
  
  return (
    <nav>
      {/* Always visible - Core modules */}
      <NavItem to="/assets">Assets</NavItem>
      <NavItem to="/work-orders">Work Orders</NavItem>
      
      {/* Conditionally visible - Licensed modules */}
      {hasModule('preventive_maintenance') && (
        <NavItem to="/preventive-maintenance">Preventive Maintenance</NavItem>
      )}
      
      {hasModule('predictive_maintenance') && (
        <NavItem to="/predictive-maintenance">
          Predictive Maintenance
          <Badge>New</Badge>
        </NavItem>
      )}
      
      {hasModule('inventory_management') && (
        <NavItem to="/inventory">Inventory</NavItem>
      )}
      
      {/* Show locked modules with upgrade prompt */}
      {!hasModule('calibration_management') && (
        <NavItem 
          onClick={() => showUpgradeModal('calibration_management')}
          className="locked"
        >
          Calibration <LockIcon />
        </NavItem>
      )}
    </nav>
  );
};
```

### 6.4 Module Discovery UI

**Locked Module Experience:**
```
┌─────────────────────────────────────────────────────┐
│  🔒 PREDICTIVE MAINTENANCE                           │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Use AI and IoT to predict failures before they     │
│  happen. Reduce downtime by up to 50%.              │
│                                                      │
│  ✓ Real-time condition monitoring                   │
│  ✓ Anomaly detection                                │
│  ✓ Failure prediction algorithms                    │
│  ✓ Integration with 50+ IoT sensors                 │
│                                                      │
│  This module is not included in your current plan.  │
│                                                      │
│  [Start 30-Day Free Trial]  [Upgrade Plan]          │
│  [Schedule Demo]            [Learn More]            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 6.5 Mobile App Module Detection

**Mobile Strategy:**
- App includes all module code
- Module visibility controlled by API responses
- Locked modules show "Upgrade Required" screens
- Seamless activation without app update
- Offline mode respects last-known license state

---

## 7. User Stories for Module Management

### User Story 7.1: Superadmin Activates Module
**As a** superadmin  
**I want to** activate modules for customer organizations  
**So that** customers can access features they've purchased

**Acceptance Criteria:**
- Superadmin can search for organizations
- Superadmin sees current modules and tier
- Superadmin can activate/deactivate modules with one click
- Superadmin can set expiration dates
- Superadmin can configure trial periods
- System sends notification to customer admin immediately
- Module appears in customer UI within 5 seconds
- Activation is logged in audit trail

### User Story 7.2: Customer Discovers Locked Module
**As a** maintenance manager  
**I want to** see what modules are available but not activated  
**So that** I can request access to features that would help my team

**Acceptance Criteria:**
- Locked modules appear in navigation with lock icon
- User can click locked module to see description
- System shows module benefits and features
- User can request trial or upgrade from interface
- Request is routed to account manager or billing
- User receives confirmation of request submission
- No errors occur when attempting to access locked modules

### User Story 7.3: Organization Admin Requests Module
**As an** organization administrator  
**I want to** request activation of additional modules  
**So that** I can extend system capabilities for my team

**Acceptance Criteria:**
- Admin can view all available modules
- Admin can see pricing for each module
- Admin can request trial or purchase
- Request includes justification and expected usage
- Superadmin receives notification
- Admin receives response within 24 business hours
- Upon approval, module activates automatically

### User Story 7.4: Monitor Module Usage
**As a** superadmin  
**I want to** monitor module usage across all organizations  
**So that** I can identify optimization opportunities and upsell candidates

**Acceptance Criteria:**
- Dashboard shows usage by organization and module
- Usage metrics include: active users, transactions, API calls
- Underutilized modules are flagged
- Organizations approaching limits are highlighted
- Reports can be exported for analysis
- Trends are visualized over time
- Anomalies trigger alerts

### User Story 7.5: Handle License Expiration
**As a** system administrator  
**I want to** gracefully handle module license expirations  
**So that** users have time to renew without data loss

**Acceptance Criteria:**
- Users receive notifications 30, 14, 7 days before expiration
- Grace period of 7 days after expiration
- During grace period, module is read-only
- Users can export data during grace period
- After grace period, module is fully locked
- Data is archived for 90 days
- Renewal restores full access immediately

---

## 8. Module Dependencies

Some modules depend on others. The system enforces these dependencies:

### Dependency Matrix:

| Module | Depends On |
|--------|------------|
| Predictive Maintenance | Asset Management (Advanced), Meter Reading |
| Calibration Management | Asset Management (Advanced), Document Management |
| Energy Management | Meter Reading, Advanced Analytics |
| Project Management | Work Order Management (Advanced) |
| Advanced Mobile | Scheduling & Planning |
| Purchasing | Inventory Management |
| Safety & Compliance | Document Management |

**Enforcement:**
- Cannot activate dependent module without prerequisites
- Deactivating prerequisite shows warning about dependent modules
- Superadmin can override with justification

---

## 9. Migration & Upgrade Paths

### 9.1 Tier Upgrades

**From Starter → Professional:**
- All existing data remains accessible
- New module features become available immediately
- User training resources provided
- Optional onboarding session

**From Professional → Enterprise:**
- Advanced features unlock in existing modules
- New modules appear in navigation
- Data model automatically extends
- Integration options become available

**From Enterprise → Enterprise Plus:**
- Premium features unlock
- API access expanded
- White-label options available
- Dedicated success manager assigned

### 9.2 Downgrades

**Downgrade Process:**
1. 30-day notice recommended
2. Data export tools provided
3. Read-only access to downgraded modules for 30 days
4. Archived data retained for 90 days
5. Re-upgrade restores all data

**Data Handling:**
- Data in downgraded modules becomes read-only
- Reports can still reference the data
- Export capabilities remain available
- No data deletion unless explicitly requested

---

## 10. Licensing Model Options

### Option A: User-Based Licensing
- Price per user per month
- Users can access all licensed modules
- Concurrent user limits can apply
- Best for: Organizations with defined teams

### Option B: Module-Based Licensing
- Price per module per organization
- Unlimited users within organization
- Module limits but no user limits
- Best for: Large organizations, flat pricing

### Option C: Hybrid Licensing
- Base price + per-user fees for premium modules
- Core modules: unlimited users
- Advanced modules: per-user pricing
- Best for: Flexible scaling

### Option D: Usage-Based Licensing
- Price based on transactions (work orders, assets, etc.)
- All modules available
- Pay for what you use
- Best for: Variable usage patterns

**Recommended:** Hybrid Licensing (Option C)
- Predictable base costs
- Scales with user growth
- Incentivizes module adoption

---

## 11. Implementation Checklist

### Phase 1: Foundation
- [ ] Design module licensing database schema
- [ ] Build superadmin module management UI
- [ ] Implement backend module guards
- [ ] Create frontend module detection hooks
- [ ] Build module discovery/upgrade UI

### Phase 2: Enforcement
- [ ] Implement API-level module checks
- [ ] Add frontend route guards
- [ ] Build grace period logic
- [ ] Create data archival system
- [ ] Implement usage tracking

### Phase 3: User Experience
- [ ] Design locked module screens
- [ ] Build in-app upgrade flows
- [ ] Create trial activation system
- [ ] Implement notification system
- [ ] Build billing integration

### Phase 4: Management
- [ ] Build usage analytics dashboard
- [ ] Create license compliance reports
- [ ] Implement automated renewals
- [ ] Build customer self-service portal
- [ ] Create sales/CRM integration

---

## 12. Success Metrics

### For Your Business:
- Module adoption rate per tier
- Upgrade conversion rate (trial → paid)
- Revenue per customer (by tier)
- Module utilization rate
- Customer lifetime value increase

### For Customers:
- Time-to-value for new modules
- Feature discovery rate
- User satisfaction by module
- ROI per module activation

---

## 13. Conclusion

This modular licensing framework provides:

✅ **Flexibility** - Customers pay for what they need  
✅ **Scalability** - Easy to add features as they grow  
✅ **Control** - Superadmin has complete oversight  
✅ **Revenue Optimization** - Multiple upsell opportunities  
✅ **User Experience** - Smooth discovery and activation  
✅ **Technical Simplicity** - Single codebase, feature flags  

The system allows you to compete at any level - from simple starter plans to enterprise-wide deployments - while maintaining a single, unified product.

---

**Next Steps:**
1. Define your initial tier structure and pricing
2. Identify must-have vs. optional modules for launch
3. Build module management infrastructure
4. Create trial and upgrade workflows
5. Train sales/support teams on module benefits
6. Launch with 2-3 tiers, expand over time

