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
  async getUsers(organizationId: string) {
    return this.request(`/users?organizationId=${organizationId}`);
  }

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

  async updateUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    roleId?: string;
  }) {
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
    name?: string;
    category?: string;
    location?: string;
    status?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    assignedTo?: string;
    notes?: string;
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
    assetId?: string;
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedToId?: string;
    dueDate?: string;
  }) {
    return this.request('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkOrder(id: string, data: {
    organizationId: string;
    assetId?: string;
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedToId?: string;
    dueDate?: string;
    completedAt?: string;
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

  // Organizations APIs
  async getOrganizations() {
    return this.request('/organizations');
  }

  async getOrganization(id: string) {
    return this.request(`/organizations/${id}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
