import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import { theme } from './src/theme/tokens';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LocationProvider, useLocation } from './src/context/LocationContext';
import { CartProvider, useCart } from './src/context/CartContext';
import { BottomNav, TabType } from './src/components/BottomNav';
import { FloatingCart } from './src/components/FloatingCart';
import { HomeScreen } from './src/screens/HomeScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { CartScreen } from './src/screens/CartScreen';
import { AccountScreen } from './src/screens/AccountScreen';
import { AddressModal } from './src/components/AddressModal';
import { ProductDetailModal } from './src/components/ProductDetailModal';
import { CheckoutModal } from './src/components/CheckoutModal';
import { OrderTimelineModal } from './src/components/OrderTimelineModal';
import { SupportModal } from './src/components/SupportModal';
import { AuthModal } from './src/components/AuthModal';
import { StoreSwitchModal } from './src/components/StoreSwitchModal';
import { ProductSummary, OrderSummary } from '@sbyte/shared-types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');

  // Modals
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportOrderId, setSupportOrderId] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<OrderSummary | null>(null);

  const { totalItems, subtotal, storeConflict, resolveStoreConflict } = useCart();

  const handleOrderSuccess = (order: OrderSummary) => {
    setTrackedOrder(order);
  };

  const handleOpenSupport = (orderId?: string) => {
    setSupportOrderId(orderId);
    setSupportModalOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryTeal} />

      <View style={styles.screenContainer}>
        {/* Render Active Tab Screen */}
        {activeTab === 'home' && (
          <HomeScreen
            onOpenAddressModal={() => setAddressModalOpen(true)}
            onOpenProductDetail={(prod) => setSelectedProduct(prod)}
            onSelectCategoryTab={(catId) => {
              setSelectedCategoryTab(catId);
              setActiveTab('categories');
            }}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesScreen
            initialCategoryId={selectedCategoryTab}
            onOpenProductDetail={(prod) => setSelectedProduct(prod)}
          />
        )}

        {activeTab === 'cart' && (
          <CartScreen
            onOpenCheckout={() => setCheckoutModalOpen(true)}
            onOpenAddressModal={() => setAddressModalOpen(true)}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'account' && (
          <AccountScreen
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenAddressModal={() => setAddressModalOpen(true)}
            onOpenSupportModal={handleOpenSupport}
            onSelectOrder={(ord) => setTrackedOrder(ord)}
          />
        )}

        {/* Floating Cart Bar (Home & Categories tabs when cart has items) */}
        {(activeTab === 'home' || activeTab === 'categories') && totalItems > 0 && (
          <FloatingCart
            totalItems={totalItems}
            totalAmount={subtotal}
            onPress={() => setActiveTab('cart')}
          />
        )}
      </View>

      {/* Persistent Bottom 4-Tab Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartCount={totalItems}
        cartSubtotal={subtotal}
      />

      {/* Interactive Sub-flow Modals */}
      <AddressModal
        visible={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
      />

      <AuthModal
        visible={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <ProductDetailModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectRelated={(p) => setSelectedProduct(p)}
      />

      <CheckoutModal
        visible={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <OrderTimelineModal
        order={trackedOrder}
        visible={!!trackedOrder}
        onClose={() => setTrackedOrder(null)}
        onOrderUpdated={(updated) => setTrackedOrder(updated)}
        onOpenSupport={handleOpenSupport}
      />

      <SupportModal
        visible={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        orderId={supportOrderId}
      />

      <StoreSwitchModal
        conflict={storeConflict}
        onResolve={resolveStoreConflict}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.primaryTeal,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgCream,
    position: 'relative',
  },
});
