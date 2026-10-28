import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  StoreDto,
  CategoryDto,
  ProductSummary,
  OrderSummary,
  OrderStatus,
  PaymentMethod,
  StoreCode,
  StoreOperationalStatus,
} from '@sbyte/shared-types';
import { MOBILE_PRODUCTS, MOBILE_CATEGORIES } from '../data/mockData';

// Determine default backend endpoint
// Android emulator needs 10.0.2.2, iOS simulator/Web uses localhost
const getEnvApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }
  return 'http://localhost:4000/api/v1';
};

export const API_BASE_URL = getEnvApiUrl();
const TOKEN_STORAGE_KEY = '@sbyte_access_token';
const REFRESH_STORAGE_KEY = '@sbyte_refresh_token';
const USER_STORAGE_KEY = '@sbyte_user_session';

export interface ServiceabilityResult {
  serviceable: boolean;
  storeId?: string;
  storeName?: string;
  storeCode?: string;
  distanceKm?: number;
  deliveryEstimateMin?: number;
  message?: string;
}

export interface CheckoutPayload {
  storeId: string;
  deliveryAddressId?: string;
  paymentMethod: PaymentMethod;
  customerNotes?: string;
  idempotencyKey?: string;
}

class ApiClient {
  private baseUrl = API_BASE_URL;
  private isOnline = true;

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  async saveSession(accessToken: string, refreshToken: string, user: any) {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_STORAGE_KEY, accessToken],
        [REFRESH_STORAGE_KEY, refreshToken],
        [USER_STORAGE_KEY, JSON.stringify(user)],
      ]);
    } catch (e) {
      console.warn('Failed to save session to storage', e);
    }
  }

  async clearSession() {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_STORAGE_KEY,
        REFRESH_STORAGE_KEY,
        USER_STORAGE_KEY,
      ]);
    } catch (e) {
      console.warn('Failed to clear session', e);
    }
  }

  async getStoredUser(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackData?: T,
  ): Promise<T> {
    const token = await this.getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      this.isOnline = true;

      if (!res.ok) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch {}
        const errorMsg = errorData.message || `Request failed with status ${res.status}`;
        const error = new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
        (error as any).status = res.status;
        (error as any).code = errorData.code;
        (error as any).payload = errorData;
        throw error;
      }

      return (await res.json()) as T;
    } catch (err: any) {
      clearTimeout(timeout);
      // If server unreachable and fallback data is provided, use fallback gracefully
      if (fallbackData !== undefined && (err.name === 'AbortError' || err.message?.includes('Network') || !err.status)) {
        this.isOnline = false;
        console.warn(`[ApiClient] Endpoint ${endpoint} unreachable. Using fallback catalog.`);
        return fallbackData;
      }
      throw err;
    }
  }

  // --- Health Check ---
  async checkHealth(): Promise<{ status: string; database?: string; isLive: boolean }> {
    try {
      const data = await this.request<any>('/health', { method: 'GET' });
      return { ...data, isLive: true };
    } catch {
      return { status: 'offline', isLive: false };
    }
  }

  // --- Authentication ---
  async login(emailOrPhone: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password }),
    });
    if (res.tokens?.accessToken) {
      await this.saveSession(res.tokens.accessToken, res.tokens.refreshToken, res.user);
    }
    return res;
  }

  async register(payload: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.tokens?.accessToken) {
      await this.saveSession(res.tokens.accessToken, res.tokens.refreshToken, res.user);
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore server logout errors
    } finally {
      await this.clearSession();
    }
  }

  // --- Stores & Serviceability ---
  async getStores(): Promise<StoreDto[]> {
    const defaultStores: StoreDto[] = [
      {
        id: 'store-palayamkottai',
        code: StoreCode.PALAYAMKOTTAI,
        name: 'S BYTE Palayamkottai Flagship',
        locality: 'Palayamkottai, Tirunelveli',
        address: '142 Rahmath Nagar Main Road, Palayamkottai',
        city: 'Tirunelveli',
        state: 'Tamil Nadu',
        pincode: '627002',
        latitude: 8.718,
        longitude: 77.749,
        serviceRadiusKm: 6.5,
        deliveryEstimateMin: 12,
        minOrderAmount: 99,
        freeDeliveryThreshold: 299,
        baseDeliveryFee: 25,
        handlingFee: 5,
        operationalStatus: StoreOperationalStatus.ONLINE,
        phone: '+919876543210',
        openTime: '06:00',
        closeTime: '23:00',
        isOpen: true,
      },
      {
        id: 'store-vannarpettai',
        code: StoreCode.VANNARPETTAI,
        name: 'S BYTE Vannarpettai Branch',
        locality: 'Vannarpettai, Tirunelveli',
        address: '28 North Bypass Road, Vannarpettai',
        city: 'Tirunelveli',
        state: 'Tamil Nadu',
        pincode: '627003',
        latitude: 8.728,
        longitude: 77.728,
        serviceRadiusKm: 5.0,
        deliveryEstimateMin: 15,
        minOrderAmount: 99,
        freeDeliveryThreshold: 299,
        baseDeliveryFee: 25,
        handlingFee: 5,
        operationalStatus: StoreOperationalStatus.ONLINE,
        phone: '+919876543210',
        openTime: '06:00',
        closeTime: '23:00',
        isOpen: true,
      },
      {
        id: 'store-town',
        code: StoreCode.TIRUNELVELI_TOWN,
        name: 'S BYTE Tirunelveli Town Branch',
        locality: 'Tirunelveli Town',
        address: '9 West Car Street, Near Nellaiyappar Temple',
        city: 'Tirunelveli',
        state: 'Tamil Nadu',
        pincode: '627006',
        latitude: 8.733,
        longitude: 77.698,
        serviceRadiusKm: 5.5,
        deliveryEstimateMin: 15,
        minOrderAmount: 99,
        freeDeliveryThreshold: 299,
        baseDeliveryFee: 25,
        handlingFee: 5,
        operationalStatus: StoreOperationalStatus.ONLINE,
        phone: '+919876543210',
        openTime: '06:00',
        closeTime: '23:00',
        isOpen: true,
      },
    ];

    return this.request<StoreDto[]>('/stores', { method: 'GET' }, defaultStores);
  }

  async resolveServiceability(latitude: number, longitude: number): Promise<ServiceabilityResult> {
    try {
      return await this.request<ServiceabilityResult>('/stores/resolve-serviceability', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude }),
      });
    } catch (e) {
      // Local calculation fallback if server is offline
      const stores = await this.getStores();
      let bestStore: StoreDto | null = null;
      let minDistance = Infinity;

      for (const s of stores) {
        // Haversine formula
        const R = 6371;
        const dLat = ((latitude - s.latitude) * Math.PI) / 180;
        const dLon = ((longitude - s.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((s.latitude * Math.PI) / 180) *
            Math.cos((latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        if (dist <= s.serviceRadiusKm && dist < minDistance) {
          minDistance = dist;
          bestStore = s;
        }
      }

      if (bestStore) {
        return {
          serviceable: true,
          storeId: bestStore.id,
          storeName: bestStore.name,
          storeCode: bestStore.code,
          distanceKm: parseFloat(minDistance.toFixed(2)),
          deliveryEstimateMin: bestStore.deliveryEstimateMin,
          message: `Delivery available in ${bestStore.deliveryEstimateMin} mins from ${bestStore.name}`,
        };
      }

      return {
        serviceable: false,
        message: 'Your location is currently outside our 15-minute quick delivery radius.',
      };
    }
  }

  // --- Categories ---
  async getCategories(): Promise<CategoryDto[]> {
    return this.request<CategoryDto[]>(
      '/categories',
      { method: 'GET' },
      MOBILE_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.id.toLowerCase(),
        icon: c.icon,
        sortOrder: 1,
        subcategories: [],
      })),
    );
  }

  // --- Products Catalog ---
  async getProducts(params?: {
    storeId?: string;
    categoryId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: ProductSummary[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.storeId) qs.append('storeId', params.storeId);
    if (params?.categoryId && params.categoryId !== 'ALL') qs.append('categoryId', params.categoryId);
    if (params?.search) qs.append('search', params.search);
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.offset) qs.append('offset', String(params.offset));

    const endpoint = `/products?${qs.toString()}`;

    // Filter fallback data
    let fallback = [...MOBILE_PRODUCTS];
    if (params?.categoryId && params.categoryId !== 'ALL') {
      fallback = fallback.filter((p) => p.category === params.categoryId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      fallback = fallback.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.tamilName && p.tamilName.includes(q)),
      );
    }

    return this.request<{ items: ProductSummary[]; total: number }>(
      endpoint,
      { method: 'GET' },
      { items: fallback, total: fallback.length },
    );
  }

  // --- Cart ---
  async getCartSummary(): Promise<any> {
    return this.request('/cart', { method: 'GET' });
  }

  async addCartItem(payload: {
    storeId: string;
    variantId: string;
    quantity: number;
    replaceExistingCart?: boolean;
  }): Promise<any> {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async removeCartItem(variantId: string): Promise<any> {
    return this.request(`/cart/items/${variantId}`, {
      method: 'DELETE',
    });
  }

  async applyCoupon(code: string): Promise<any> {
    return this.request('/cart/apply-coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // --- Orders & Checkout ---
  async checkout(payload: CheckoutPayload): Promise<OrderSummary> {
    return this.request<OrderSummary>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getOrders(): Promise<OrderSummary[]> {
    return this.request<OrderSummary[]>('/orders', { method: 'GET' }, []);
  }

  async getOrderById(id: string): Promise<OrderSummary> {
    return this.request<OrderSummary>(`/orders/${id}`, { method: 'GET' });
  }

  async cancelOrder(id: string, reason: string): Promise<OrderSummary> {
    return this.request<OrderSummary>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // --- User Profile & Addresses ---
  async getProfile(): Promise<any> {
    return this.request('/users/me', { method: 'GET' });
  }

  async getAddresses(): Promise<any[]> {
    return this.request<any[]>('/users/addresses', { method: 'GET' }, []);
  }

  async addAddress(address: {
    tag: 'HOME' | 'WORK' | 'OTHER';
    recipientName: string;
    phone: string;
    streetAddress: string;
    landmark?: string;
    locality: string;
    city?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }): Promise<any> {
    return this.request('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  // --- Support ---
  async createTicket(ticket: {
    orderId?: string;
    subject: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }): Promise<any> {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  // --- Notifications ---
  async getNotifications(): Promise<any[]> {
    return this.request<any[]>('/notifications', { method: 'GET' }, []);
  }
}

export const api = new ApiClient();
