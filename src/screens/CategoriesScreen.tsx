import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme/tokens';
import { MOBILE_CATEGORIES, MOBILE_PRODUCTS } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { ProductSummary } from '@sbyte/shared-types';

interface CategoriesScreenProps {
  initialCategoryId?: string;
  onOpenProductDetail: (product: ProductSummary) => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  initialCategoryId = 'ALL',
  onOpenProductDetail,
}) => {
  const [selectedCatId, setSelectedCatId] = useState(
    initialCategoryId === 'ALL' ? MOBILE_CATEGORIES[1].id : initialCategoryId,
  );
  const { cart, addToCart, removeFromCart } = useCart();

  const activeCategory = MOBILE_CATEGORIES.find((c) => c.id === selectedCatId) || MOBILE_CATEGORIES[1];

  const categoryProducts = MOBILE_PRODUCTS.filter(
    (p) => p.category === selectedCatId,
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.title}>All Categories</Text>
        <Text style={styles.subTitle}>Explore mini-supermarket departments</Text>
      </View>

      <View style={styles.contentRow}>
        {/* Left Sidebar Category Strip */}
        <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
          {MOBILE_CATEGORIES.filter((c) => c.id !== 'ALL').map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.sidebarItem, isSelected && styles.activeSidebarItem]}
                onPress={() => setSelectedCatId(cat.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconCircle,
                    isSelected && styles.activeIconCircle,
                  ]}
                >
                  <Text style={styles.sidebarIcon}>{cat.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.sidebarName,
                    isSelected && styles.activeSidebarName,
                  ]}
                  numberOfLines={2}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Right Pane: Products in Category */}
        <ScrollView style={styles.rightPane} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.categoryHeaderCard}>
            <Text style={styles.catHeading}>{activeCategory.name}</Text>
            <Text style={styles.catCount}>{categoryProducts.length} items available</Text>
          </View>

          {categoryProducts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No items currently stocked in this department.</Text>
            </View>
          ) : (
            categoryProducts.map((prod) => {
              const qty = cart[prod.id] || 0;
              const price = prod.discountPrice ?? prod.basePrice;
              const hasDiscount = prod.discountPrice && prod.discountPrice < prod.basePrice;

              return (
                <TouchableOpacity
                  key={prod.id}
                  style={styles.itemRow}
                  onPress={() => onOpenProductDetail(prod)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: prod.imageUrl }} style={styles.itemImg} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.brand}>{prod.brand}</Text>
                    <Text style={styles.name} numberOfLines={2}>{prod.name}</Text>
                    {prod.tamilName && (
                      <Text style={styles.tamilName} numberOfLines={1}>{prod.tamilName}</Text>
                    )}
                    <Text style={styles.packSize}>{prod.packageSize}</Text>

                    <View style={styles.priceRow}>
                      <View>
                        <Text style={styles.price}>₹{price}</Text>
                        {hasDiscount && (
                          <Text style={styles.mrp}>₹{prod.basePrice}</Text>
                        )}
                      </View>

                      {/* Add Button */}
                      {qty === 0 ? (
                        <TouchableOpacity
                          style={styles.addBtn}
                          onPress={() => addToCart(prod)}
                        >
                          <Text style={styles.addBtnText}>ADD</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.qtyControl}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => removeFromCart(prod.id)}
                          >
                            <Text style={styles.qtyBtnText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyNum}>{qty}</Text>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => addToCart(prod)}
                          >
                            <Text style={styles.qtyBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCream,
  },
  topHeader: {
    backgroundColor: theme.colors.primaryTeal,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  subTitle: {
    fontSize: 12,
    color: '#AABEB6',
    marginTop: 2,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 90,
    backgroundColor: theme.colors.bgMuted,
    borderRightWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  activeSidebarItem: {
    backgroundColor: theme.colors.bgCard,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primaryTeal,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeIconCircle: {
    backgroundColor: theme.colors.accentLimeSubtle,
  },
  sidebarIcon: {
    fontSize: 20,
  },
  sidebarName: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSlate,
    textAlign: 'center',
  },
  activeSidebarName: {
    color: theme.colors.primaryTeal,
    fontWeight: '800',
  },
  rightPane: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  categoryHeaderCard: {
    backgroundColor: theme.colors.bgCard,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  catHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  catCount: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    color: theme.colors.textSlate,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgCard,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  itemImg: {
    width: 74,
    height: 74,
    borderRadius: 10,
    backgroundColor: theme.colors.bgMuted,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  tamilName: {
    fontSize: 11,
    color: theme.colors.primaryTeal,
  },
  packSize: {
    fontSize: 11,
    color: theme.colors.textSlate,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryTeal,
  },
  mrp: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryTeal,
    borderRadius: 8,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtnText: {
    color: theme.colors.accentLime,
    fontSize: 14,
    fontWeight: '800',
  },
  qtyNum: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 4,
  },
});
