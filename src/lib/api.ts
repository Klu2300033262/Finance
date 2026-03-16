// API service for MERN backend integration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debug: Log the API URL
console.log('API_BASE_URL:', API_BASE_URL);
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }

  // Authentication endpoints
  async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await this.handleResponse(response);
    
    // Store token
    if (data.data?.token) {
      localStorage.setItem('auth_token', data.data.token);
    }
    
    return data;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await this.handleResponse(response);
    
    // Store token
    if (data.data?.token) {
      localStorage.setItem('auth_token', data.data.token);
    }
    
    return data;
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async updateProfile(userData: {
    firstName?: string;
    lastName?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    return this.handleResponse(response);
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  // Transaction endpoints
  async getTransactions(params?: {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/transactions?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getTransaction(id: string) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async createTransaction(transactionData: {
    amount: number;
    description: string;
    category: string;
    type: 'income' | 'expense';
    date?: string;
    tags?: string[];
  }) {
    console.log('API Service - Sending transaction data:', transactionData);
    const headers = this.getAuthHeaders();
    console.log('API Service - Headers:', headers);
    
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(transactionData)
    });
    
    console.log('API Service - Response status:', response.status);
    const responseData = await response.text();
    console.log('API Service - Response body:', responseData);
    
    // Parse and return
    try {
      return JSON.parse(responseData);
    } catch {
      return { success: false, message: responseData };
    }
  }

  async updateTransaction(id: string, transactionData: Partial<{
    amount: number;
    description: string;
    category: string;
    type: 'income' | 'expense';
    date: string;
    tags: string[];
  }>) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(transactionData)
    });
    
    return this.handleResponse(response);
  }

  async deleteTransaction(id: string) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/transactions/categories/list`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  // Budget endpoints
  async getBudgets(period?: string) {
    const queryString = period ? `?period=${period}` : '';
    const response = await fetch(`${API_BASE_URL}/budgets${queryString}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getBudgetAlerts() {
    const response = await fetch(`${API_BASE_URL}/budgets/alerts`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async createBudget(budgetData: {
    category: string;
    amount: number;
    period?: string;
    startDate?: string;
    endDate?: string;
    alertThreshold?: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(budgetData)
    });
    
    return this.handleResponse(response);
  }

  async updateBudget(id: string, budgetData: Partial<{
    amount: number;
    period: string;
    startDate: string;
    endDate: string;
    alertThreshold: number;
    isActive: boolean;
  }>) {
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(budgetData)
    });
    
    return this.handleResponse(response);
  }

  async deleteBudget(id: string) {
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  // Analytics endpoints
  async getDashboardAnalytics(startDate: string, endDate: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard?startDate=${startDate}&endDate=${endDate}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getSummaryAnalytics(period?: string) {
    const queryString = period ? `?period=${period}` : '';
    const response = await fetch(`${API_BASE_URL}/analytics/summary${queryString}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getTrendsAnalytics(period?: string, months?: number) {
    const params = new URLSearchParams({ 
      period: period || 'monthly',
      months: months?.toString() || '12'
    });
    const response = await fetch(`${API_BASE_URL}/analytics/trends?${params}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getCategoriesAnalytics(startDate: string, endDate: string, type?: string) {
    const params = new URLSearchParams({ 
      startDate, 
      endDate,
      type: type || 'expense'
    });
    const response = await fetch(`${API_BASE_URL}/analytics/categories?${params}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getComparisonAnalytics(currentPeriodStart: string, currentPeriodEnd: string, previousPeriodStart: string, previousPeriodEnd: string) {
    const params = new URLSearchParams({ 
      currentPeriodStart, 
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd
    });
    const response = await fetch(`${API_BASE_URL}/analytics/comparison?${params}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
