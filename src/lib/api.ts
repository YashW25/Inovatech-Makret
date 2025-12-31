/**
 * API Service Layer
 * Centralized API client for all backend requests
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get auth token from localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Get auth headers
 */
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Make API request
 */
const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.error || 'An error occurred',
      response.status,
      data
    );
  }

  return data;
};

/**
 * Auth API
 */
export const authApi = {
  sendOTP: async (email: string, role?: 'customer' | 'seller') => {
    return request<{ success: boolean; message: string; otp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  verifyOTP: async (email: string, otp: string, role?: 'customer' | 'seller') => {
    return request<{ success: boolean; token: string; user: any }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, role }),
    });
  },

  login: async (email: string, password: string, role?: 'customer' | 'seller' | 'super_admin') => {
    return request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  register: async (email: string, password: string, role: 'customer' | 'seller' = 'customer') => {
    return request<{ success: boolean; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  getMe: async () => {
    return request<{ user: any }>('/auth/me');
  },
};

/**
 * Products API
 */
export const productsApi = {
  getAll: async (params?: { category?: string; sellerId?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.sellerId) query.append('sellerId', params.sellerId);
    if (params?.search) query.append('search', params.search);
    
    return request<{ products: any[] }>(`/products?${query.toString()}`);
  },

  getById: async (id: string) => {
    return request<{ product: any }>(`/products/${id}`);
  },

  create: async (product: any) => {
    return request<{ product: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  update: async (id: string, product: Partial<any>) => {
    return request<{ product: any }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  getMyProducts: async () => {
    return request<{ products: any[] }>('/products/seller/my-products');
  },
};

/**
 * Sellers API
 */
export const sellersApi = {
  getProfile: async () => {
    return request<{ seller: any }>('/sellers/profile');
  },

  updateProfile: async (data: { storeName?: string; storeDescription?: string }) => {
    return request<{ seller: any }>('/sellers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getStats: async () => {
    return request<{ products: number; orders: number; revenue: number; commissionOwed: number }>('/sellers/stats');
  },
};

/**
 * Bargains API
 */
export const bargainsApi = {
  createOffer: async (productId: string, offerPrice: number) => {
    return request<{ offer: any }>('/bargains/offer', {
      method: 'POST',
      body: JSON.stringify({ productId, offerPrice }),
    });
  },

  getMyOffers: async () => {
    return request<{ offers: any[] }>('/bargains/my-offers');
  },

  getSellerRequests: async () => {
    return request<{ offers: any[] }>('/bargains/seller/requests');
  },

  accept: async (id: string) => {
    return request<{ offer: any }>(`/bargains/${id}/accept`, {
      method: 'POST',
    });
  },

  reject: async (id: string) => {
    return request<{ offer: any }>(`/bargains/${id}/reject`, {
      method: 'POST',
    });
  },

  counter: async (id: string, counterPrice: number) => {
    return request<{ offer: any }>(`/bargains/${id}/counter`, {
      method: 'POST',
      body: JSON.stringify({ counterPrice }),
    });
  },
};

/**
 * Orders API
 */
export const ordersApi = {
  create: async (order: { items: any[]; paymentMethod: 'cod' | 'online' }) => {
    return request<{ order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  getMyOrders: async () => {
    return request<{ orders: any[] }>('/orders/my-orders');
  },

  getSellerOrders: async () => {
    return request<{ orders: any[] }>('/orders/seller/orders');
  },

  updateStatus: async (id: string, status: string) => {
    return request<{ order: any }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

/**
 * Admin API
 */
export const adminApi = {
  getStats: async () => {
    return request<{ stats: any }>('/admin/stats');
  },

  getSellers: async () => {
    return request<{ sellers: any[] }>('/admin/sellers');
  },

  updateSellerStatus: async (id: string, status: 'active' | 'suspended' | 'banned') => {
    return request<{ seller: any }>(`/admin/sellers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getSettings: async () => {
    return request<{ settings: any }>('/admin/settings');
  },

  updateSettings: async (settings: any) => {
    return request<{ settings: any }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

export { ApiError };

