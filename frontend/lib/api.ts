/**
 * API Client for CMMS Backend
 * Base URL configured to use Next.js API proxy
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
      console.error('API Request failed:', error);
      throw error;
    }
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

  async getPMScheduleStats(organizationId: string) {
    return this.request(`/pm-schedules/stats?organizationId=${organizationId}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
