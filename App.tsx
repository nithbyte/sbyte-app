import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { Header } from './src/components/Header';
import { CategoryList } from './src/components/CategoryList';
import { ProductCard } from './src/components/ProductCard';
import { FloatingCart } from './src/components/FloatingCart';
import { CartModal } from './src/components/CartModal';
import { OrderTrackModal } from './src/components/OrderTrackModal';
import { MOBILE_PRODUCTS } from './src/data/mockData';
import { theme } from './src/theme/tokens';
import { ProductSummary, StoreCode } from '@sbyte/shared-types';

export default function App() {
  const [selectedLocality, setSelectedLocality] = useState<'Palayamkottai' | 'Vannarpettai' | 'Town'>('Palayamkottai');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState<Record<string, number>>({
    'prod-001': 1, // Pre-seeded with Ponni rice
    'prod-004': 1, // Pre-seeded with Tirunelveli Halwa
  });

  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [activeOrderNumber, setActiveOrderNumber] = useState('');

  // Filtering products
  const filteredProducts = MOBILE_PRODUCTS.filter((prod) => {
    const matchesCat = selectedCategory === 'ALL' || prod.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      prod.name.toLowerCase().includes(q) ||
      prod.brand.toLowerCase().includes(q) ||
      (prod.tamilName && prod.tamilName.includes(q));
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (product: ProductSummary) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  const totalItems = Object.values(cart).reduce((sum, count) => sum + count, 0);

  const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MOBILE_PRODUCTS.find((p) => p.id === id);
    if (!item) return sum;
    const price = item.discountPrice ?? item.basePrice;
    return sum + price * qty;
  }, 0);

  const cartItemList = Object.entries(cart)
    .map(([id, quantity]) => ({
      product: MOBILE_PRODUCTS.find((p) => p.id === id)!,
      quantity,
    }))
    .filter((item) => item.product !== undefined);

  const handlePlaceOrder = () => {
    const prefix = selectedLocality === 'Palayamkottai' ? 'PLK' : selectedLocality === 'Vannarpettai' ? 'VNP' : 'TWN';
    const num = `SB-${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    setActiveOrderNumber(num);
    setCartModalOpen(false);
    setCart({});
    setTrackingModalOpen(true);
  };

  const toggleLocality = () => {
    if (selectedLocality === 'Palayamkottai') setSelectedLocality('Vannarpettai');
    else if (selectedLocality === 'Vannarpettai') setSelectedLocality('Town');
    else setSelectedLocality('Palayamkottai');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryTeal} />

      {/* Brand Header & Delivery SLA */}
      <Header
        currentLocality={selectedLocality}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectLocality={toggleLocality}
      />

      {/* Category Pills */}
      <CategoryList
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Promotional Store Banner */}
      <View style={styles.storeBanner}>
        <Text style={styles.bannerStore}>
          📍 S BYTE {selectedLocality} Mini-Supermarket
        </Text>
        <Text style={styles.bannerSub}>
          Express 15-Min Delivery • Fresh Farm Produce & Daily Essentials
        </Text>
      </View>

      {/* Product Catalog Grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridHeader}>
          <Text style={styles.gridTitle}>
            {selectedCategory === 'ALL' ? 'Featured in Tirunelveli' : 'Category Products'}
          </Text>
          <Text style={styles.gridCount}>{filteredProducts.length} items</Text>
        </View>

        <View style={styles.grid}>
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              quantity={cart[prod.id] || 0}
              onAdd={() => handleAddToCart(prod)}
              onRemove={() => handleRemoveFromCart(prod.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      <FloatingCart
        totalItems={totalItems}
        totalAmount={totalAmount}
        onPress={() => setCartModalOpen(true)}
      />

      {/* Cart & Checkout Modal */}
      <CartModal
        visible={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cartItems={cartItemList}
        currentLocality={selectedLocality}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Order Tracking Modal */}
      <OrderTrackModal
        visible={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        orderNumber={activeOrderNumber}
        storeName={`S BYTE ${selectedLocality}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCream,
  },
  storeBanner: {
    backgroundColor: theme.colors.bgMuted,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  bannerStore: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryTeal,
  },
  bannerSub: {
    fontSize: 11,
    color: theme.colors.textSlate,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90, // room for floating cart
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  gridCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
