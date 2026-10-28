import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/tokens';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { SByteLogo } from '../components/SByteLogo';
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
}) => {
  const { currentStore, availableStores, selectStore, currentAddress } = useLocation();
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
      bg: '#0E332C',
      accent: '#C8F169',
    },
    {
      title: 'Flat ₹100 Off on Groceries',
      subtitle: 'On orders above ₹499 • Use code SBYTE100',
      tag: 'MEGA DEAL',
      code: 'SBYTE100',
      bg: '#09211C',
      accent: '#FFF9EF',
    },
    {
      title: 'Alangulam Farm Vegetables',
      subtitle: 'Country tomatoes, greens & daily farm essentials',
      tag: 'LOCAL SOURCED',
      code: 'FRESH10',
      bg: '#16433A',
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
        {/* Brand Row with S BYTE Logo & 15-Min Delivery Badge */}
        <View style={styles.topBrandRow}>
          <SByteLogo variant="compact" size={32} light={true} />

          <View style={styles.slaBadge}>
            <Ionicons name="flash" size={14} color="#0D2D27" />
            <View>
              <Text style={styles.slaNumber}>15 MINS</Text>
              <Text style={styles.slaSub}>Express Delivery</Text>
            </View>
          </View>
        </View>

        {/* Location Selector Bar */}
        <TouchableOpacity
          style={styles.locationSelector}
          onPress={onOpenAddressModal}
          activeOpacity={0.82}
        >
          <View style={styles.locIconWrap}>
            <Ionicons name="location-sharp" size={16} color={theme.colors.accentLime} />
          </View>
          <View style={styles.locTextCol}>
            <View style={styles.locMainRow}>
              <Text style={styles.locName} numberOfLines={1}>
                {currentAddress.locality || 'Palayamkottai'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={theme.colors.accentLime} />
            </View>
            <Text style={styles.locSub} numberOfLines={1}>
              {currentAddress.streetAddress || 'Tap to choose delivery location'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#123D35" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groceries, Halwa, rice, snacks..."
            placeholderTextColor="#8C948F"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchAction}>
              <Ionicons name="close-circle" size={18} color="#8C948F" />
            </TouchableOpacity>
          ) : (
            <View style={styles.searchAction}>
              <Ionicons name="mic-outline" size={18} color="#8C948F" />
            </View>
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
            tintColor={theme.colors.accentLime}
          />
        }
      >
        {/* Promotional Banner Carousel */}
        <View style={styles.bannerContainer}>
          <TouchableOpacity
            style={[styles.bannerCard, { backgroundColor: banners[activeBannerIdx].bg }]}
            activeOpacity={0.92}
            onPress={() =>
              setActiveBannerIdx((prev) => (prev + 1) % banners.length)
            }
          >
            <View style={styles.bannerHeaderRow}>
              <View style={styles.bannerBadge}>
                <Ionicons name="flame" size={12} color="#0D2D27" />
                <Text style={styles.bannerBadgeText}>{banners[activeBannerIdx].tag}</Text>
              </View>
              <Text style={styles.bannerCounter}>
                {activeBannerIdx + 1}/{banners.length}
              </Text>
            </View>

            <Text style={styles.bannerTitle}>{banners[activeBannerIdx].title}</Text>
            <Text style={styles.bannerSub}>{banners[activeBannerIdx].subtitle}</Text>

            <View style={styles.bannerFooterRow}>
              <View style={styles.bannerCodePill}>
                <Text style={styles.bannerCodeText}>CODE: {banners[activeBannerIdx].code}</Text>
              </View>
              <Text style={styles.bannerTapHint}>Tap for next offer →</Text>
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
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithIcon}>
                <Ionicons name="storefront" size={18} color="#123D35" />
                <Text style={styles.shopsTitle}>Local Supermarkets & Shops</Text>
              </View>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{availableStores.length} ONLINE</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopsScroll}>
              {availableStores.map((store) => {
                const isSelected = currentStore?.id === store.id;
                return (
                  <TouchableOpacity
                    key={store.id}
                    style={[styles.shopCard, isSelected && styles.activeShopCard]}
                    onPress={() => selectStore(store)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.shopTopRow}>
                      <View style={[styles.storeIconWrap, isSelected && styles.activeStoreIconWrap]}>
                        <Ionicons
                          name="business"
                          size={16}
                          color={isSelected ? theme.colors.accentLime : '#123D35'}
                        />
                      </View>
                      {isSelected ? (
                        <View style={styles.activePill}>
                          <Ionicons name="checkmark-circle" size={11} color="#0D2D27" />
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

                    <View style={styles.shopLocationRow}>
                      <Ionicons name="location-outline" size={12} color="#6E7D77" />
                      <Text style={styles.shopLocality} numberOfLines={1}>
                        {store.locality || store.city}
                      </Text>
                    </View>

                    <View style={styles.shopMetaRow}>
                      <View style={styles.shopMetaBadge}>
                        <Ionicons name="flash" size={11} color="#123D35" />
                        <Text style={styles.shopEta}>{store.deliveryEstimateMin || 15} mins</Text>
                      </View>
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
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.vectorIcon}
                    size={16}
                    color={isSelected ? theme.colors.accentLime : '#4A5B54'}
                    style={{ marginRight: 6 }}
                  />
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
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithIcon}>
                <Ionicons name="flash" size={18} color="#FF9800" />
                <Text style={styles.sectionTitle}>Flash Deals & Offers</Text>
              </View>
              <View style={styles.offerBadge}>
                <Text style={styles.offerBadgeText}>UP TO 20% OFF</Text>
              </View>
            </View>

            <View style={styles.grid}>
              {flashDeals.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={styles.gridItem}
                  onPress={() => onOpenProductDetail(prod)}
                  activeOpacity={0.92}
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
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithIcon}>
                <Ionicons name="sparkles" size={18} color="#123D35" />
                <Text style={styles.sectionTitle}>Tirunelveli Specials</Text>
              </View>
              <Text style={styles.sectionSubtext}>Farm to Table</Text>
            </View>

            <View style={styles.grid}>
              {regionalSpecials.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={styles.gridItem}
                  onPress={() => onOpenProductDetail(prod)}
                  activeOpacity={0.92}
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
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Ionicons name="grid" size={17} color="#123D35" />
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'ALL'
                  ? searchQuery
                    ? `Results for "${searchQuery}"`
                    : 'Popular Daily Essentials'
                  : 'Department Products'}
              </Text>
            </View>
            <Text style={styles.itemCount}>{filtered.length} items</Text>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={44} color="#8C948F" />
              <Text style={styles.emptyTitle}>No matching products</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search query or picking another supermarket department.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={styles.gridItem}
                  onPress={() => onOpenProductDetail(prod)}
                  activeOpacity={0.92}
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
    backgroundColor: '#F8F9F7',
  },
  topBar: {
    backgroundColor: '#0E332C',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  topBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  slaBadge: {
    backgroundColor: theme.colors.accentLime,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  slaNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0D2D27',
    letterSpacing: 0.5,
  },
  slaSub: {
    fontSize: 8,
    fontWeight: '800',
    color: '#16433A',
    textTransform: 'uppercase',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 105, 0.2)',
  },
  locIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(200, 241, 105, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locTextCol: {
    flex: 1,
  },
  locMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  locSub: {
    fontSize: 11,
    color: '#A9BDB5',
    marginTop: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#16231F',
    fontWeight: '500',
  },
  searchAction: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  bannerCard: {
    borderRadius: 18,
    padding: 16,
    minHeight: 128,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 105, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bannerBadgeText: {
    color: '#0D2D27',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bannerCounter: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '700',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 8,
  },
  bannerSub: {
    fontSize: 12,
    color: '#D2DFD9',
    marginTop: 3,
  },
  bannerFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  bannerCodePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  bannerCodeText: {
    color: theme.colors.accentLime,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTapHint: {
    color: 'rgba(200, 241, 105, 0.85)',
    fontSize: 11,
    fontWeight: '700',
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
    backgroundColor: '#D4DDD8',
  },
  activeDot: {
    backgroundColor: '#0E332C',
    width: 18,
  },
  shopsSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shopsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16231F',
  },
  badgePill: {
    backgroundColor: 'rgba(18, 61, 53, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#123D35',
    letterSpacing: 0.4,
  },
  shopsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  shopCard: {
    width: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E6EBE8',
    shadowColor: '#123D35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  activeShopCard: {
    borderColor: '#123D35',
    backgroundColor: '#F5FAF7',
  },
  shopTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EBF2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStoreIconWrap: {
    backgroundColor: '#0E332C',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    color: '#0D2D27',
    fontSize: 9,
    fontWeight: '900',
  },
  switchPill: {
    backgroundColor: '#F0F3F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  switchPillText: {
    color: '#55665F',
    fontSize: 9,
    fontWeight: '800',
  },
  shopName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16231F',
  },
  shopLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  shopLocality: {
    fontSize: 11,
    color: '#6E7D77',
  },
  shopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFF3F0',
  },
  shopMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(200, 241, 105, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shopEta: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0E332C',
  },
  shopMinOrder: {
    fontSize: 11,
    color: '#8A9993',
    fontWeight: '600',
  },
  categorySection: {
    paddingVertical: 12,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E7E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  activeCategoryPill: {
    backgroundColor: '#0E332C',
    borderColor: '#0E332C',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C3A35',
  },
  activeCategoryName: {
    color: theme.colors.accentLime,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16231F',
  },
  offerBadge: {
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E65100',
    letterSpacing: 0.4,
  },
  sectionSubtext: {
    fontSize: 11,
    color: '#6E7D77',
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 11,
    color: '#8A9993',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16231F',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#6E7D77',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 250,
  },
});
