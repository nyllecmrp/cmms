/**
 * API Client for CMMS Backend
 * Base URL configured to connect directly to NestJS backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Only log errors that aren't expected auth failures
      if (!(error instanceof Error && error.message === 'Unauthorized' && endpoint === '/auth/me')) {
        console.error('API Request failed:', error);
      }
      throw error;
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      url = `${endpoint}?${queryString}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication APIs
  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    organizationId: string;
    role?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  // Module Licensing APIs
  async getOrganizationModules(organizationId: string) {
    return this.request(`/module-licensing/organization/${organizationId}/modules`);
  }

  async checkModuleAccess(organizationId: string, moduleCode: string) {
    return this.request(`/module-licensing/organization/${organizationId}/module/${moduleCode}/access`);
  }

  async getExpiringLicenses() {
    return this.request('/module-licensing/expiring');
  }

  async activateModule(data: {
    organizationId: string;
    moduleCode: string;
    expiresAt?: string;
    maxUsers?: number;
    activatedById: string;
  }) {
    return this.request('/module-licensing/activate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deactivateModule(data: {
    organizationId: string;
    moduleCode: string;
    deactivatedById: string;
  }) {
    return this.request('/module-licensing/deactivate', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  async activateTierModules(data: {
    organizationId: string;
    tier: string;
    activatedById: string;
    expiresAt?: string;
  }) {
    return this.request('/module-licensing/activate-tier', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async startTrial(data: {
    organizationId: string;
    moduleCode: string;
    userId: string;
    days?: number;
  }) {
    return this.request('/module-licensing/start-trial', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getModuleUsage(organizationId: string, moduleCode?: string) {
    const query = moduleCode ? `?moduleCode=${moduleCode}` : '';
    return this.request(`/module-licensing/organization/${organizationId}/usage${query}`);
  }

  async trackModuleUsage(data: {
    organizationId: string;
    moduleCode: string;
    activeUsers?: number;
    transactions?: number;
    apiCalls?: number;
    storageUsed?: number;
  }) {
    return this.request('/module-licensing/track-usage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User Management APIs
  async inviteUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    organizationId: string;
  }) {
    return this.request('/users/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) {
    return this.request(`/auth/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNotifications(userId: string, data: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  }) {
    return this.request(`/users/${userId}/notifications`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Module Request APIs
  async createModuleRequest(data: {
    organizationId: string;
    requestedById: string;
    moduleCode: string;
    requestType: string;
    justification?: string;
    expectedUsage?: string;
  }) {
    return this.request('/module-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getModuleRequests(organizationId: string) {
    return this.request(`/module-requests?organizationId=${organizationId}`);
  }

  async getOrganizationModuleRequests(organizationId: string) {
    return this.request(`/module-requests/organization/${organizationId}`);
  }

  async getPendingModuleRequests() {
    return this.request('/module-requests/pending');
  }

  async getModuleRequest(id: string) {
    return this.request(`/module-requests/${id}`);
  }

  async reviewModuleRequest(id: string, data: {
    reviewedById: string;
    status: string;
    reviewNotes?: string;
  }) {
    return this.request(`/module-requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteModuleRequest(id: string) {
    return this.request(`/module-requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Assets APIs
  async getAssets(organizationId: string) {
    return this.request(`/assets?organizationId=${organizationId}`);
  }

  async getAsset(id: string, organizationId: string) {
    return this.request(`/assets/${id}?organizationId=${organizationId}`);
  }

  async getAssetStats(organizationId: string) {
    return this.request(`/assets/stats?organizationId=${organizationId}`);
  }

  async createAsset(data: {
    organizationId: string;
    createdById: string;
    name: string;
    assetNumber: string;
    category: string;
    status: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    locationId?: string;
    parentAssetId?: string;
    assignedTo?: string;
    notes?: string;
  }) {
    return this.request('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAsset(id: string, data: {
    organizationId: string;
    assetNumber?: string;
    name?: string;
    description?: string;
    category?: string;
    status?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: string;
    warrantyExpiresAt?: string;
    locationId?: string;
    parentAssetId?: string;
    criticality?: string;
    imageUrl?: string;
    customFields?: string;
  }) {
    return this.request(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAsset(id: string, organizationId: string) {
    return this.request(`/assets/${id}?organizationId=${organizationId}`, {
      method: 'DELETE',
    });
  }

  async getAssetMaintenanceHistory(assetId: string) {
    return this.request(`/assets/${assetId}/maintenance-history`);
  }

  // Work Orders APIs
  async getWorkOrders(organizationId: string) {
    return this.request(`/work-orders?organizationId=${organizationId}`);
  }

  async getWorkOrder(id: string, organizationId: string) {
    return this.request(`/work-orders/${id}?organizationId=${organizationId}`);
  }

  async getWorkOrderStats(organizationId: string) {
    return this.request(`/work-orders/stats?organizationId=${organizationId}`);
  }

  async createWorkOrder(data: {
    organizationId: string;
    createdById: string;
    workOrderNumber: string;
    title: string;
    description?: string;
    type?: string;
    priority: string;
    status: string;
    assetId?: string;
    assignedToId?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    estimatedHours?: number;
    notes?: string;
  }) {
    return this.request('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkOrder(id: string, data: {
    organizationId: string;
    workOrderNumber?: string;
    title?: string;
    description?: string;
    type?: string;
    priority?: string;
    status?: string;
    assetId?: string;
    assignedToId?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    actualStart?: string;
    actualEnd?: string;
    estimatedHours?: number;
    actualHours?: number;
    laborCost?: number;
    partsCost?: number;
    totalCost?: number;
    notes?: string;
  }) {
    return this.request(`/work-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkOrder(id: string, organizationId: string) {
    return this.request(`/work-orders/${id}?organizationId=${organizationId}`, {
      method: 'DELETE',
    });
  }

  async updateWorkOrderStatus(id: string, status: string) {
    return this.request(`/work-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Organizations APIs
  async getOrganizations() {
    return this.request('/organizations');
  }

  async getOrganization(id: string) {
    return this.request(`/organizations/${id}`);
  }

  async createOrganization(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    industry?: string;
    tier?: string;
    maxUsers?: number;
  }) {
    return this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    industry?: string;
    tier?: string;
    maxUsers?: number;
  }) {
    return this.request(`/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteOrganization(id: string) {
    return this.request(`/organizations/${id}`, {
      method: 'DELETE',
    });
  }

  async createOrganizationAdmin(organizationId: string, password: string, fullName: string) {
    return this.request(`/organizations/${organizationId}/create-admin`, {
      method: 'POST',
      body: JSON.stringify({ password, fullName }),
    });
  }

  async getTrialStatus(organizationId: string) {
    return this.request(`/organizations/${organizationId}/trial-status`);
  }

  // Users APIs
  async getUsers(organizationId: string) {
    return this.request(`/users?organizationId=${organizationId}`);
  }

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(userId: string, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Locations APIs
  async getLocations(organizationId: string) {
    return this.request(`/locations?organizationId=${organizationId}`);
  }

  async getLocation(id: string) {
    return this.request(`/locations/${id}`);
  }

  async getLocationStats(organizationId: string) {
    return this.request(`/locations/stats?organizationId=${organizationId}`);
  }

  async createLocation(data: {
    organizationId: string;
    name: string;
    type?: string;
    parentId?: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  }) {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLocation(id: string, data: {
    name?: string;
    type?: string;
    parentId?: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  }) {
    return this.request(`/locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLocation(id: string) {
    return this.request(`/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // PM Schedules
  async getPMSchedules(organizationId: string) {
    return this.request(`/pm-schedules?organizationId=${organizationId}`);
  }

  async getPMSchedule(id: string) {
    return this.request(`/pm-schedules/${id}`);
  }

  async createPMSchedule(data: any) {
    return this.request('/pm-schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePMSchedule(id: string, data: any) {
    return this.request(`/pm-schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updatePMScheduleStatus(id: string, status: string) {
    return this.request(`/pm-schedules/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deletePMSchedule(id: string) {
    return this.request(`/pm-schedules/${id}`, {
      method: 'DELETE',
    });
  }

  async generateWorkOrderFromPMSchedule(pmScheduleId: string, userId: string) {
    return this.request(`/pm-schedules/${pmScheduleId}/generate-work-order`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async completePMSchedule(pmScheduleId: string) {
    return this.request(`/pm-schedules/${pmScheduleId}/complete`, {
      method: 'POST',
    });
  }

  async getPMScheduleStats(organizationId: string) {
    return this.request(`/pm-schedules/stats?organizationId=${organizationId}`);
  }

  // Purchase Requests APIs
  async getPurchaseRequests(organizationId: string, status?: string) {
    let url = `/purchase-requests?organizationId=${organizationId}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.request(url);
  }

  async getPurchaseRequest(id: string) {
    return this.request(`/purchase-requests/${id}`);
  }

  async createPurchaseRequest(data: {
    organizationId: string;
    title: string;
    description?: string;
    priority?: string;
    type?: string;
    pmScheduleId?: string;
    workOrderId?: string;
    assetId?: string;
    items: string;
    estimatedCost?: number;
    notes?: string;
    requestedById: string;
  }) {
    return this.request('/purchase-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchaseRequest(id: string, data: any) {
    return this.request(`/purchase-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async approvePurchaseRequest(id: string, approvedById: string) {
    return this.request(`/purchase-requests/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approvedById }),
    });
  }

  async rejectPurchaseRequest(id: string, rejectedById: string, rejectionReason: string) {
    return this.request(`/purchase-requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectedById, rejectionReason }),
    });
  }

  async markPurchaseRequestAsPurchased(id: string, actualCost?: number) {
    return this.request(`/purchase-requests/${id}/mark-purchased`, {
      method: 'PATCH',
      body: JSON.stringify({ actualCost }),
    });
  }

  async deletePurchaseRequest(id: string) {
    return this.request(`/purchase-requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Purchase Orders APIs
  async getPurchaseOrders(organizationId: string, status?: string) {
    let url = `/purchase-orders?organizationId=${organizationId}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.request(url);
  }

  async getPurchaseOrder(id: string) {
    return this.request(`/purchase-orders/${id}`);
  }

  async createPurchaseOrder(data: {
    organizationId: string;
    purchaseRequestId?: string;
    supplierName: string;
    supplierContact?: string;
    supplierEmail?: string;
    supplierAddress?: string;
    items: string;
    subtotal?: number;
    tax?: number;
    shippingCost?: number;
    totalCost?: number;
    orderDate?: string;
    expectedDelivery?: string;
    notes?: string;
    termsAndConditions?: string;
    paymentTerms?: string;
    shippingMethod?: string;
    createdById: string;
  }) {
    return this.request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchaseOrder(id: string, data: any) {
    return this.request(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async sendPurchaseOrder(id: string, approvedById: string) {
    return this.request(`/purchase-orders/${id}/send`, {
      method: 'POST',
      body: JSON.stringify({ approvedById }),
    });
  }

  async receivePurchaseOrder(id: string, receivedById: string, actualDelivery?: string) {
    return this.request(`/purchase-orders/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify({ receivedById, actualDelivery }),
    });
  }

  async cancelPurchaseOrder(id: string) {
    return this.request(`/purchase-orders/${id}/cancel`, {
      method: 'POST',
    });
  }

  async deletePurchaseOrder(id: string) {
    return this.request(`/purchase-orders/${id}`, {
      method: 'DELETE',
    });
  }

  async getPurchaseRequestStats(organizationId: string) {
    return this.request(`/purchase-requests/stats?organizationId=${organizationId}`);
  }

  // Notifications APIs
  async getNotifications(unreadOnly?: boolean) {
    const query = unreadOnly ? '?unreadOnly=true' : '';
    return this.request(`/notifications${query}`);
  }

  async getUnreadNotificationCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Billing APIs
  async calculatePrice(tier: string, userCount: number, billingCycle: 'monthly' | 'annual') {
    return this.request(`/billing/calculate-price?tier=${tier}&userCount=${userCount}&billingCycle=${billingCycle}`);
  }

  async createSubscription(data: {
    organizationId: string;
    tier: string;
    userCount: number;
    billingCycle: 'monthly' | 'annual';
    paymentMethod: string;
  }) {
    return this.request('/billing/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getActiveSubscription(organizationId: string) {
    return this.request(`/billing/organizations/${organizationId}/subscription`);
  }

  async cancelSubscription(subscriptionId: string, reason?: string) {
    return this.request(`/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getPaymentHistory(organizationId: string) {
    return this.request(`/billing/organizations/${organizationId}/payments`);
  }

  async processPayment(data: {
    organizationId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    metadata?: any;
  }) {
    return this.request('/billing/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== INVENTORY MANAGEMENT ====================

  // Inventory Items
  async getInventoryItems(filters?: { categoryId?: string; isActive?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/inventory/items${query}`);
  }

  async getInventoryItem(id: string) {
    return this.request(`/inventory/items/${id}`);
  }

  async createInventoryItem(data: {
    partNumber: string;
    name: string;
    description?: string;
    categoryId?: string;
    manufacturer?: string;
    modelNumber?: string;
    unitOfMeasure?: string;
    unitCost?: number;
    minimumStock?: number;
    maximumStock?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
    leadTimeDays?: number;
    supplierId?: string;
    supplierPartNumber?: string;
    barcode?: string;
    storageLocation?: string;
    shelfLife?: number;
    warrantyPeriod?: number;
    notes?: string;
  }) {
    return this.request('/inventory/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: string, data: any) {
    return this.request(`/inventory/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryItem(id: string) {
    return this.request(`/inventory/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory Transactions
  async createInventoryTransaction(data: {
    itemId: string;
    locationId: string;
    transactionType: 'purchase' | 'usage' | 'adjustment' | 'return' | 'transfer_out' | 'transfer_in' | 'stock_take';
    quantity: number;
    unitCost?: number;
    referenceType?: string;
    referenceId?: string;
    fromLocationId?: string;
    toLocationId?: string;
    reason?: string;
    notes?: string;
  }) {
    return this.request('/inventory/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getItemTransactions(itemId: string, limit = 50) {
    return this.request(`/inventory/items/${itemId}/transactions?limit=${limit}`);
  }

  // Work Order Parts
  async addPartToWorkOrder(data: {
    workOrderId: string;
    itemId: string;
    locationId: string;
    quantityPlanned: number;
    quantityUsed?: number;
    unitCost: number;
    installedOn?: string;
    notes?: string;
  }) {
    return this.request('/inventory/work-order-parts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkOrderParts(workOrderId: string) {
    return this.request(`/inventory/work-orders/${workOrderId}/parts`);
  }

  // Stock Alerts
  async getStockAlerts(resolved = false) {
    return this.request(`/inventory/alerts?resolved=${resolved}`);
  }

}

export const api = new ApiClient(API_BASE_URL);
export default api;
