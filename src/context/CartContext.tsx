import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { ProductSummary } from '@sbyte/shared-types';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';

export interface CartItem {
  product: ProductSummary;
  quantity: number;
  storeId?: string;
}

export interface StoreConflict {
  existingStoreId: string;
  requestedStoreId: string;
  existingStoreName?: string;
  requestedStoreName?: string;
  pendingProduct: ProductSummary;
}

interface CartContextType {
  cart: Record<string, number>;
  cartItemList: CartItem[];
  storeId: string | null;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  handlingFee: number;
  discount: number;
  totalAmount: number;
  freeDeliveryNeeded: number;
  couponCode: string | null;
  couponError: string | null;
  appliedCouponDetails: { code: string; discountText: string } | null;
  storeConflict: StoreConflict | null;
  isLoading: boolean;
  addToCart: (product: ProductSummary, storeIdOverride?: string) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  resolveStoreConflict: (replace: boolean) => Promise<void>;
  revalidateCart: () => Promise<void>;
}

const CART_STORAGE_KEY = '@sbyte_customer_cart';
const CART_STORE_ID_KEY = '@sbyte_customer_cart_store';
const CART_COUPON_KEY = '@sbyte_customer_coupon';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { currentStore, availableStores } = useLocation();

  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartProducts, setCartProducts] = useState<Record<string, ProductSummary>>({});
  const [cartStoreId, setCartStoreId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCouponDetails, setAppliedCouponDetails] = useState<{
    code: string;
    discountText: string;
  } | null>(null);
  const [storeConflict, setStoreConflict] = useState<StoreConflict | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLocalCart();
  }, []);

  const loadLocalCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const storedStoreId = await AsyncStorage.getItem(CART_STORE_ID_KEY);
      const storedCoupon = await AsyncStorage.getItem(CART_COUPON_KEY);

      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        setCart(parsed.quantities || {});
        setCartProducts(parsed.products || {});
      }
      if (storedStoreId) {
        setCartStoreId(storedStoreId);
      }
      if (storedCoupon) {
        setCouponCode(storedCoupon);
      }
    } catch (e) {
      console.warn('Failed to load local cart', e);
    }
  };

  const persistCart = async (
    quantities: Record<string, number>,
    products: Record<string, ProductSummary>,
    storeId: string | null,
    coupon: string | null,
  ) => {
    try {
      await AsyncStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ quantities, products }),
      );
      if (storeId) {
        await AsyncStorage.setItem(CART_STORE_ID_KEY, storeId);
      } else {
        await AsyncStorage.removeItem(CART_STORE_ID_KEY);
      }
      if (coupon) {
        await AsyncStorage.setItem(CART_COUPON_KEY, coupon);
      } else {
        await AsyncStorage.removeItem(CART_COUPON_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist cart', e);
    }
  };

  const currentActiveStoreId = cartStoreId || currentStore?.id || 'store-palayamkottai';

  const addToCart = async (
    product: ProductSummary,
    storeIdOverride?: string,
  ): Promise<boolean> => {
    const targetStoreId = storeIdOverride || currentStore?.id || 'store-palayamkottai';

    // Single Fulfillment Store Constraint check
    const hasItemsInOtherStore =
      cartStoreId &&
      cartStoreId !== targetStoreId &&
      Object.keys(cart).length > 0;

    if (hasItemsInOtherStore) {
      const existingStore = availableStores.find((s) => s.id === cartStoreId);
      const newStore = availableStores.find((s) => s.id === targetStoreId);

      setStoreConflict({
        existingStoreId: cartStoreId,
        requestedStoreId: targetStoreId,
        existingStoreName: existingStore?.name || 'Current Store',
        requestedStoreName: newStore?.name || 'Selected Store',
        pendingProduct: product,
      });
      return false;
    }

    const newQty = (cart[product.id] || 0) + 1;
    const newCart = { ...cart, [product.id]: newQty };
    const newProducts = { ...cartProducts, [product.id]: product };
    const updatedStoreId = targetStoreId;

    setCart(newCart);
    setCartProducts(newProducts);
    setCartStoreId(updatedStoreId);
    await persistCart(newCart, newProducts, updatedStoreId, couponCode);

    // Sync with backend if authenticated and online
    if (isAuthenticated) {
      try {
        await api.addCartItem({
          storeId: updatedStoreId,
          variantId: product.id,
          quantity: newQty,
        });
      } catch (err) {
        // Fallback local cart remains resilient
      }
    }

    return true;
  };

  const removeFromCart = async (productId: string) => {
    const currentQty = cart[productId] || 0;
    if (currentQty <= 0) return;

    const newCart = { ...cart };
    const newProducts = { ...cartProducts };

    if (currentQty <= 1) {
      delete newCart[productId];
      delete newProducts[productId];
    } else {
      newCart[productId] = currentQty - 1;
    }

    const updatedStoreId = Object.keys(newCart).length === 0 ? null : cartStoreId;
    setCart(newCart);
    setCartProducts(newProducts);
    setCartStoreId(updatedStoreId);
    await persistCart(newCart, newProducts, updatedStoreId, couponCode);

    if (isAuthenticated) {
      try {
        await api.removeCartItem(productId);
      } catch {}
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const prod = cartProducts[productId];
    if (!prod) return;

    const newCart = { ...cart, [productId]: quantity };
    setCart(newCart);
    await persistCart(newCart, cartProducts, cartStoreId, couponCode);

    if (isAuthenticated && cartStoreId) {
      try {
        await api.addCartItem({
          storeId: cartStoreId,
          variantId: productId,
          quantity,
        });
      } catch {}
    }
  };

  const clearCart = async () => {
    setCart({});
    setCartProducts({});
    setCartStoreId(null);
    setCouponCode(null);
    setAppliedCouponDetails(null);
    setCouponError(null);
    await AsyncStorage.multiRemove([
      CART_STORAGE_KEY,
      CART_STORE_ID_KEY,
      CART_COUPON_KEY,
    ]);
  };

  const resolveStoreConflict = async (replace: boolean) => {
    if (!storeConflict) return;

    if (replace) {
      const prod = storeConflict.pendingProduct;
      const targetStoreId = storeConflict.requestedStoreId;

      const newCart = { [prod.id]: 1 };
      const newProducts = { [prod.id]: prod };

      setCart(newCart);
      setCartProducts(newProducts);
      setCartStoreId(targetStoreId);
      await persistCart(newCart, newProducts, targetStoreId, null);

      if (isAuthenticated) {
        try {
          await api.addCartItem({
            storeId: targetStoreId,
            variantId: prod.id,
            quantity: 1,
            replaceExistingCart: true,
          });
        } catch {}
      }
    }

    setStoreConflict(null);
  };

  // Pricing calculations
  const cartItemList: CartItem[] = Object.entries(cart)
    .map(([id, quantity]) => ({
      product: cartProducts[id],
      quantity,
      storeId: cartStoreId || undefined,
    }))
    .filter((i) => i.product !== undefined);

  const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const subtotal = cartItemList.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.basePrice;
    return sum + price * item.quantity;
  }, 0);

  const freeDeliveryThreshold = currentStore?.freeDeliveryThreshold || 299;
  const baseDeliveryFee = currentStore?.baseDeliveryFee || 25;
  const handlingFee = currentStore?.handlingFee || 5;

  const deliveryFee = totalItems > 0 ? (subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee) : 0;
  const freeDeliveryNeeded = Math.max(0, freeDeliveryThreshold - subtotal);

  // Coupon evaluation
  let discount = 0;
  if (couponCode === 'SBYTE100') {
    if (subtotal >= 499) {
      discount = 100;
    }
  } else if (couponCode === 'SUPERFAST15') {
    if (subtotal >= 199) {
      discount = Math.min(75, Math.round(subtotal * 0.15));
    }
  }

  const totalAmount = Math.max(0, subtotal + deliveryFee + (totalItems > 0 ? handlingFee : 0) - discount);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    const upper = code.trim().toUpperCase();

    if (upper === 'SBYTE100') {
      if (subtotal < 499) {
        setCouponError('SBYTE100 requires a minimum cart value of ₹499');
        return false;
      }
      setCouponCode('SBYTE100');
      setAppliedCouponDetails({
        code: 'SBYTE100',
        discountText: 'Flat ₹100 Discount Applied!',
      });
      await AsyncStorage.setItem(CART_COUPON_KEY, 'SBYTE100');
      return true;
    }

    if (upper === 'SUPERFAST15') {
      if (subtotal < 199) {
        setCouponError('SUPERFAST15 requires a minimum cart value of ₹199');
        return false;
      }
      setCouponCode('SUPERFAST15');
      setAppliedCouponDetails({
        code: 'SUPERFAST15',
        discountText: '15% Discount Applied (up to ₹75)!',
      });
      await AsyncStorage.setItem(CART_COUPON_KEY, 'SUPERFAST15');
      return true;
    }

    // Try server coupon validation
    try {
      const serverRes = await api.applyCoupon(upper);
      if (serverRes?.discountAmount) {
        setCouponCode(upper);
        setAppliedCouponDetails({
          code: upper,
          discountText: `Coupon applied: ₹${serverRes.discountAmount} off`,
        });
        await AsyncStorage.setItem(CART_COUPON_KEY, upper);
        return true;
      }
    } catch (e: any) {
      setCouponError(e.message || 'Invalid or expired coupon code');
      return false;
    }

    setCouponError('Invalid coupon code. Try SBYTE100 or SUPERFAST15');
    return false;
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setAppliedCouponDetails(null);
    setCouponError(null);
    AsyncStorage.removeItem(CART_COUPON_KEY);
  };

  const revalidateCart = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const summary = await api.getCartSummary();
      if (summary) {
        // reconcile server cart with local state
      }
    } catch {} finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemList,
        storeId: cartStoreId,
        totalItems,
        subtotal,
        deliveryFee,
        handlingFee: totalItems > 0 ? handlingFee : 0,
        discount,
        totalAmount,
        freeDeliveryNeeded,
        couponCode,
        couponError,
        appliedCouponDetails,
        storeConflict,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        resolveStoreConflict,
        revalidateCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
