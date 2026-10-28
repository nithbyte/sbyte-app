import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { theme } from '../theme/tokens';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { ProductSummary, ProductCategory } from '@sbyte/shared-types';
import { MOBILE_PRODUCTS, MOBILE_CATEGORIES } from '../data/mockData';
import { api } from '../api/client';

interface HomeScreenProps {
  onOpenAddressModal: () => void;
  onOpenProductDetail: (product: ProductSummary) => void;
  onSelectCategoryTab: (catId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenAddressModal,
  onOpenProductDetail,
  onSelectCategoryTab,
}) => {
  const { currentStore, availableStores, selectStore, currentAddress, serviceability } = useLocation();
  const { cart, addToCart, removeFromCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [products, setProducts] = useState<ProductSummary[]>(MOBILE_PRODUCTS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const banners = [
    {
      title: 'Tirunelveli Halwa & Snacks',
      subtitle: 'Original wheat milk halwa delivered in 15 mins',
      tag: 'FRESH TODAY',
      code: 'SUPERFAST15',
      bg: '#123D35',
      accent: '#C8F169',
    },
    {
      title: 'Flat ₹100 Off on Groceries',
      subtitle: 'On orders above ₹499 • Use code SBYTE100',
      tag: 'MEGA DEAL',
      code: 'SBYTE100',
      bg: '#0D2D27',
      accent: '#FFF9EF',
    },
    {
      title: 'Alangulam Farm Vegetables',
      subtitle: 'Country tomatoes, greens & daily essentials',
      tag: 'LOCAL SOURCED',
      code: 'FRESH10',
      bg: '#1B5449',
      accent: '#C8F169',
    },
  ];

  useEffect(() => {
    loadProducts();
  }, [currentStore?.id]);

  const loadProducts = async () => {
    try {
      const res = await api.getProducts({ storeId: currentStore?.id });
      if (res.items && res.items.length > 0) {
        setProducts(res.items);
      }
    } catch {
      setProducts(MOBILE_PRODUCTS);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadProducts();
    setIsRefreshing(false);
  };

  // Filter products by category and search
  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.tamilName && p.tamilName.includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const flashDeals = products
    .filter((p) => p.discountPrice && p.discountPrice < p.basePrice)
    .slice(0, 4);

  const regionalSpecials = products
    .filter(
      (p) =>
        p.category === ProductCategory.SNACKS_MUNCHIES ||
        p.category === ProductCategory.BEVERAGES ||
        p.category === ProductCategory.FRUITS_VEGETABLES,
    )
    .slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={styles.topBar}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.locationPill}
            onPress={onOpenAddressModal}
            activeOpacity={0.8}
          >
            <Text style={styles.locIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.locName} numberOfLines={1}>
                  {currentAddress.locality || 'Palayamkottai'}
                </Text>
                <Text style={styles.locDropdown}>▼</Text>
              </View>
              <Text style={styles.locSub} numberOfLines={1}>
                {currentAddress.streetAddress || 'Tap to select delivery location'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.slaBadge}>
            <Text style={styles.slaNumber}>15</Text>
            <Text style={styles.slaUnit}>MINS</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search groceries, Halwa, rice, snacks..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primaryTeal}
          />
        }
      >
        {/* Promotional Banner Carousel */}
        <View style={styles.bannerContainer}>
          <TouchableOpacity
            style={[styles.bannerCard, { backgroundColor: banners[activeBannerIdx].bg }]}
            activeOpacity={0.9}
            onPress={() =>
              setActiveBannerIdx((prev) => (prev + 1) % banners.length)
            }
          >
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>{banners[activeBannerIdx].tag}</Text>
            </View>
            <Text style={styles.bannerTitle}>{banners[activeBannerIdx].title}</Text>
            <Text style={styles.bannerSub}>{banners[activeBannerIdx].subtitle}</Text>
            <View style={styles.bannerCodePill}>
              <Text style={styles.bannerCodeText}>CODE: {banners[activeBannerIdx].code}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dotsRow}>
            {banners.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeBannerIdx && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        {/* Marketplace Shop Discovery Strip */}
        {availableStores && availableStores.length > 0 && (
          <View style={styles.shopsSection}>
            <View style={styles.shopsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.shopsEmoji}>🏪</Text>
                <Text style={styles.shopsTitle}>Local Supermarkets & Shops</Text>
              </View>
              <Text style={styles.shopsSubBadge}>{availableStores.length} AVAILABLE</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopsScroll}>
              {availableStores.map((store) => {
                const isSelected = currentStore?.id === store.id;
                return (
                  <TouchableOpacity
                    key={store.id}
                    style={[styles.shopCard, isSelected && styles.activeShopCard]}
                    onPress={() => selectStore(store)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.shopTopRow}>
                      <Text style={styles.shopIcon}>🏬</Text>
                      {isSelected ? (
                        <View style={styles.activePill}>
                          <Text style={styles.activePillText}>SHOPPING HERE</Text>
                        </View>
                      ) : (
                        <View style={styles.switchPill}>
                          <Text style={styles.switchPillText}>SELECT SHOP</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.shopName} numberOfLines={1}>
                      {store.name}
                    </Text>
                    <Text style={styles.shopLocality} numberOfLines={1}>
                      📍 {store.locality || store.city}
                    </Text>
                    <View style={styles.shopMetaRow}>
                      <Text style={styles.shopEta}>⚡ {store.deliveryEstimateMin || 15} mins</Text>
                      <Text style={styles.shopMinOrder}>Min ₹{store.minOrderAmount || 99}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Category Horizontal Quick Strip */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {MOBILE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, isSelected && styles.activeCategoryPill]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[styles.categoryName, isSelected && styles.activeCategoryName]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section 1: Flash Deals */}
        {selectedCategory === 'ALL' && !searchQuery && flashDeals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sectionEmoji}>⚡</Text>
                <Text style={styles.sectionTitle}>Flash Deals & Offers</Text>
              </View>
              <Text style={styles.sectionBadge}>UP TO 20% OFF</Text>
            </View>

            <View style={styles.grid}>
              {flashDeals.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={{ width: '48%', marginBottom: 12 }}
                  onPress={() => onOpenProductDetail(prod)}
                  activeOpacity={0.9}
                >
                  <ProductCard
                    product={prod}
                    quantity={cart[prod.id] || 0}
                    onAdd={() => addToCart(prod)}
                    onRemove={() => removeFromCart(prod.id)}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Section 2: Regional Specials */}
        {selectedCategory === 'ALL' && !searchQuery && regionalSpecials.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sectionEmoji}>🌴</Text>
                <Text style={styles.sectionTitle}>Tirunelveli Specials</Text>
              </View>
              <Text style={styles.sectionLink}>Farm to Table</Text>
            </View>

            <View style={styles.grid}>
              {regionalSpecials.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={{ width: '48%', marginBottom: 12 }}
                  onPress={() => onOpenProductDetail(prod)}
                  activeOpacity={0.9}
                >
                  <ProductCard
                    product={prod}
                    quantity={cart[prod.id] || 0}
                    onAdd={() => addToCart(prod)}
                    onRemove={() => removeFromCart(prod.id)}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Section 3: All Products / Filtered Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'ALL'
                ? searchQuery
                  ? `Search results for "${searchQuery}"`
                  : 'Popular Daily Essentials'
                : 'Category Products'}
            </Text>
            <Text style={styles.itemCount}>{filtered.length} items</Text>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search query or choosing another category.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={{ width: '48%', marginBottom: 12 }}
                  onPress={() => onOpenProductDetail(prod)}
                  activeOpacity={0.9}
                >
                  <ProductCard
                    product={prod}
                    quantity={cart[prod.id] || 0}
                    onAdd={() => addToCart(prod)}
                    onRemove={() => removeFromCart(prod.id)}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCream,
  },
  topBar: {
    backgroundColor: theme.colors.primaryTeal,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  locIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  locName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    marginRight: 4,
  },
  locDropdown: {
    fontSize: 10,
    color: theme.colors.accentLime,
  },
  locSub: {
    fontSize: 11,
    color: '#B2C4BD',
    marginTop: 1,
  },
  slaBadge: {
    backgroundColor: theme.colors.accentLime,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  slaNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.primaryTealDark,
    lineHeight: 15,
  },
  slaUnit: {
    fontSize: 8,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textInk,
  },
  clearSearch: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 100, // accommodate bottom tab
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  bannerCard: {
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(200, 241, 105, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  bannerBadgeText: {
    color: theme.colors.accentLime,
    fontSize: 9,
    fontWeight: '800',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
  },
  bannerSub: {
    fontSize: 12,
    color: '#E0E8E4',
    marginTop: 3,
  },
  bannerCodePill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  bannerCodeText: {
    color: theme.colors.primaryTealDark,
    fontSize: 10,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: theme.colors.primaryTeal,
    width: 16,
  },
  categorySection: {
    paddingVertical: 10,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  activeCategoryPill: {
    backgroundColor: theme.colors.primaryTeal,
    borderColor: theme.colors.primaryTeal,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textCharcoal,
  },
  activeCategoryName: {
    color: theme.colors.accentLime,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primaryTeal,
    backgroundColor: theme.colors.accentLimeSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectionLink: {
    fontSize: 11,
    color: theme.colors.textSlate,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textSlate,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  shopsSection: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  shopsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopsEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  shopsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  shopsSubBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primaryTeal,
    backgroundColor: theme.colors.accentLimeSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shopsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  shopCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  activeShopCard: {
    borderColor: theme.colors.primaryTeal,
    backgroundColor: '#F0FDF4',
  },
  shopTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shopIcon: {
    fontSize: 18,
  },
  activePill: {
    backgroundColor: theme.colors.primaryTeal,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    color: '#FFF9EF',
    fontSize: 9,
    fontWeight: '800',
  },
  switchPill: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  switchPillText: {
    color: '#4B5563',
    fontSize: 9,
    fontWeight: '700',
  },
  shopName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  shopLocality: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  shopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  shopEta: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryTeal,
  },
  shopMinOrder: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});
