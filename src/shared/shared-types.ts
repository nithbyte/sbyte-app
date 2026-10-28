/**
 * S BYTE Shared Domain Types
 * Core business definitions for S Byte Quick-Commerce Mini-Supermarkets
 */

export enum StoreCode {
  PALAYAMKOTTAI = 'SBYTE_PLK_01',
  VANNARPETTAI = 'SBYTE_VNP_02',
  TIRUNELVELI_TOWN = 'SBYTE_TWN_03',
}

export enum StoreOperationalStatus {
  ONLINE = 'ONLINE',
  BUSY = 'BUSY',
  TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED',
  MAINTENANCE = 'MAINTENANCE',
}

export interface StoreLocation {
  id: string;
  code: string | StoreCode;
  name: string;
  tenantId?: string;
  locality: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
  deliveryEstimateMin: number;
  operationalStatus: StoreOperationalStatus;
  minOrderAmount: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  handlingFee: number;
  phone: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
  STORE_MANAGER = 'STORE_MANAGER',
  INVENTORY_STAFF = 'INVENTORY_STAFF',
  PICKING_STAFF = 'PICKING_STAFF',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  CUSTOMER = 'CUSTOMER',
  // Backward compatibility alias
  INVENTORY_CLERK = 'INVENTORY_STAFF',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum ProductCategory {
  GROCERIES_STAPLES = 'GROCERIES_STAPLES',
  FRUITS_VEGETABLES = 'FRUITS_VEGETABLES',
  SNACKS_MUNCHIES = 'SNACKS_MUNCHIES',
  BEVERAGES = 'BEVERAGES',
  PLASTIC_HOUSEHOLD = 'PLASTIC_HOUSEHOLD',
  KITCHEN_ESSENTIALS = 'KITCHEN_ESSENTIALS',
  CLEANING_SUPPLIES = 'CLEANING_SUPPLIES',
  STATIONERY = 'STATIONERY',
  PERSONAL_CARE = 'PERSONAL_CARE',
}

export enum UnitOfMeasure {
  GRAM = 'g',
  KILOGRAM = 'kg',
  MILLILITER = 'ml',
  LITER = 'l',
  PIECE = 'pc',
  PACK = 'pack',
}

export enum StockMovementType {
  INWARD = 'INWARD',
  AUDIT_ADJUSTMENT = 'AUDIT_ADJUSTMENT',
  ORDER_RESERVATION = 'ORDER_RESERVATION',
  ORDER_FULFILLED = 'ORDER_FULFILLED',
  ORDER_CANCELLED_RETURN = 'ORDER_CANCELLED_RETURN',
  DAMAGED_WASTE = 'DAMAGED_WASTE',
}

export interface ProductSummary {
  id: string;
  sku: string;
  name: string;
  tamilName?: string;
  description: string;
  category: ProductCategory;
  brand: string;
  imageUrl: string;
  unit: UnitOfMeasure;
  packageSize: string;
  basePrice: number;
  discountPrice?: number;
  isVeg?: boolean;
}

export interface StoreInventoryItem {
  id: string;
  storeId: string;
  storeCode: StoreCode;
  productId: string;
  product: ProductSummary;
  quantityOnHand: number;
  quantityReserved: number;
  availableStock: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  maxPerOrder: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PACKING = 'PACKING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  UPI = 'UPI',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  CARD = 'CARD',
  NETBANKING = 'NETBANKING',
}

export enum CodSettlementStatus {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  PENDING_COLLECTION = 'PENDING_COLLECTION',
  COLLECTED_BY_RIDER = 'COLLECTED_BY_RIDER',
  SETTLED_AT_STORE = 'SETTLED_AT_STORE',
}

export enum DeliveryAssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  id?: string;
  productId?: string;
  variantId?: string;
  sku: string;
  productName: string;
  tamilName?: string;
  packageSize?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerAddress {
  id: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  landmark?: string;
  locality: string;
  city?: string;
  state?: string;
  pincode: string;
  latitude: number;
  longitude: number;
  tag: 'HOME' | 'WORK' | 'OTHER';
  isDefault?: boolean;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  storeId: string;
  storeCode: StoreCode;
  storeName?: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  handlingFee: number;
  discount: number;
  taxAmount?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: CustomerAddress;
  placedAt: string;
  estimatedDeliveryAt: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  role: UserRole;
  storeId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export type StoreDto = StoreLocation;

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sortOrder?: number;
  subcategories?: any[];
}

export interface AuthTokenPayload {
  sub: string; // User ID
  phone: string;
  email?: string;
  role: UserRole;
  storeId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  statusCode: number;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  requestId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  requestId: string;
  timestamp: string;
}

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export enum LoyaltyTxType {
  EARNED_PURCHASE = 'EARNED_PURCHASE',
  REDEEMED_ORDER = 'REDEEMED_ORDER',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  EXPIRED = 'EXPIRED',
}

export interface LoyaltyAccountDto {
  id: string;
  userId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  referralCode: string;
  referredBy?: string | null;
}

export interface LoyaltyTransactionDto {
  id: string;
  points: number;
  type: LoyaltyTxType;
  referenceId?: string | null;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  ORDERED = 'ORDERED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export interface SupplierDto {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  gstNumber?: string | null;
  paymentTerms?: string | null;
  isActive: boolean;
}

export enum StockTransferStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  DISPATCHED = 'DISPATCHED',
  RECEIVED = 'RECEIVED',
  REJECTED = 'REJECTED',
}

export enum TicketCategory {
  ORDER_DELIVERY = 'ORDER_DELIVERY',
  PAYMENT_REFUND = 'PAYMENT_REFUND',
  PRODUCT_QUALITY = 'PRODUCT_QUALITY',
  DAMAGED_EXPIRED = 'DAMAGED_EXPIRED',
  APP_ACCOUNT = 'APP_ACCOUNT',
  OTHER = 'OTHER',
}

export enum ReturnRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INSPECTED = 'INSPECTED',
  REFUNDED = 'REFUNDED',
}

export interface ReturnRequestDto {
  id: string;
  returnNumber: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  storeId: string;
  quantity: number;
  reason: string;
  status: ReturnRequestStatus;
  refundAmount: number;
  staffNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface ShoppingListDto {
  id: string;
  userId: string;
  name: string;
  items: Array<{
    id: string;
    variantId: string;
    quantity: number;
    notes?: string | null;
    variant?: any;
  }>;
  createdAt: string;
}

export interface ShoppingReminderDto {
  id: string;
  userId: string;
  title: string;
  frequencyDays: number;
  timeOfDay: string;
  isActive: boolean;
  lastNotifiedAt?: string | null;
}

export enum TenantStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum TenantPlan {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE',
}

export interface TenantDto {
  id: string;
  slug: string;
  name: string;
  displayName?: string;
  logoUrl?: string;
  status: TenantStatus;
  contactEmail: string;
  contactPhone: string;
  gstin?: string;
  fssaiNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  commissionRate?: number;
  plan: TenantPlan;
  stores?: StoreLocation[];
  createdAt: string;
  updatedAt: string;
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIALING = 'TRIALING',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface TenantSubscriptionDto {
  id: string;
  tenantId: string;
  plan: TenantPlan;
  status: SubscriptionStatus;
  monthlyPrice: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export enum DeliveryOfferStatus {
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface DeliveryOfferDto {
  id: string;
  orderId: string;
  riderId: string;
  status: DeliveryOfferStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  declinedAt?: string | null;
  declinedReason?: string | null;
  createdAt: string;
  order?: {
    orderNumber: string;
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    paymentMethod: string;
    status: OrderStatus;
    itemsCount?: number;
    store: {
      name: string;
      address: string;
      locality: string;
      phone: string;
      latitude?: number;
      longitude?: number;
    };
    deliveryAddress: {
      addressLine1: string;
      locality: string;
      landmark?: string | null;
      pincode: string;
      latitude?: number;
      longitude?: number;
    };
  };
}
