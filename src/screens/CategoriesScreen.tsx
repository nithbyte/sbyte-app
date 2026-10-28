import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/tokens';
import { MOBILE_CATEGORIES, MOBILE_PRODUCTS } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { SByteLogo } from '../components/SByteLogo';
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
        <View style={styles.headerLeft}>
          <SByteLogo variant="icon" size={28} />
          <View>
            <Text style={styles.title}>Supermarket Aisle</Text>
            <Text style={styles.subTitle}>Explore all fresh & grocery departments</Text>
          </View>
        </View>
        <View style={styles.slaBadge}>
          <Ionicons name="flash" size={12} color="#0D2D27" />
          <Text style={styles.slaText}>15 MINS</Text>
        </View>
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
                  <Ionicons
                    name={cat.vectorIcon}
                    size={18}
                    color={isSelected ? theme.colors.accentLime : '#52625B'}
                  />
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
                {isSelected && <View style={styles.activeBar} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Right Pane: Products in Category */}
        <ScrollView
          style={styles.rightPane}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          <View style={styles.categoryHeaderCard}>
            <View>
              <Text style={styles.catHeading}>{activeCategory.name}</Text>
              <Text style={styles.catCount}>{categoryProducts.length} items ready for dispatch</Text>
            </View>
            <View style={styles.catIconWrap}>
              <Ionicons name={activeCategory.vectorIcon} size={22} color="#123D35" />
            </View>
          </View>

          {categoryProducts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="cube-outline" size={40} color="#8C948F" />
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
                  activeOpacity={0.88}
                >
                  <View style={styles.imgWrap}>
                    <Image source={{ uri: prod.imageUrl }} style={styles.itemImg} />
                    <View style={styles.vegDotSmall} />
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.brand}>{prod.brand}</Text>
                    <Text style={styles.name} numberOfLines={2}>
                      {prod.name}
                    </Text>
                    {prod.tamilName && (
                      <Text style={styles.tamilName} numberOfLines={1}>
                        {prod.tamilName}
                      </Text>
                    )}
                    <View style={styles.packBadge}>
                      <Text style={styles.packSize}>{prod.packageSize}</Text>
                    </View>

                    <View style={styles.priceRow}>
                      <View style={styles.priceCol}>
                        <Text style={styles.price}>₹{price}</Text>
                        {hasDiscount && (
                          <Text style={styles.mrp}>₹{prod.basePrice}</Text>
                        )}
                      </View>

                      {/* Add Button / Stepper */}
                      {qty === 0 ? (
                        <TouchableOpacity
                          style={styles.addBtn}
                          onPress={() => addToCart(prod)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.addBtnText}>ADD</Text>
                          <Ionicons name="add" size={13} color="#0D2D27" />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.qtyControl}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => removeFromCart(prod.id)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="remove" size={12} color="#FFFFFF" />
                          </TouchableOpacity>
                          <Text style={styles.qtyNum}>{qty}</Text>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => addToCart(prod)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="add" size={12} color="#FFFFFF" />
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
    backgroundColor: '#F8F9F7',
  },
  topHeader: {
    backgroundColor: '#0E332C',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subTitle: {
    fontSize: 11,
    color: '#B0C2BB',
    marginTop: 1,
  },
  slaBadge: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  slaText: {
    color: '#0D2D27',
    fontSize: 10,
    fontWeight: '900',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 90,
    backgroundColor: '#EEF3F0',
    borderRightWidth: 1,
    borderRightColor: '#DEE4E1',
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  activeSidebarItem: {
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DFE7E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  activeIconCircle: {
    backgroundColor: '#0E332C',
  },
  sidebarName: {
    fontSize: 10,
    color: '#55655E',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 13,
  },
  activeSidebarName: {
    color: '#0E332C',
    fontWeight: '800',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3.5,
    backgroundColor: '#123D35',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  rightPane: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  categoryHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6ECE9',
  },
  catHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16231F',
  },
  catCount: {
    fontSize: 11,
    color: '#7B8A84',
    marginTop: 2,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(200, 241, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 12,
    color: '#7B8A84',
    textAlign: 'center',
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6ECE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  imgWrap: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F5F7F5',
    overflow: 'hidden',
    position: 'relative',
    marginRight: 10,
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  vegDotSmall: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E8E3E',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 9,
    color: '#8A9993',
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16231F',
    lineHeight: 17,
  },
  tamilName: {
    fontSize: 11,
    color: '#123D35',
    fontWeight: '600',
  },
  packBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F4F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  packSize: {
    fontSize: 10,
    color: '#556660',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '900',
    color: '#102A24',
  },
  mrp: {
    fontSize: 11,
    color: '#8F9B96',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addBtnText: {
    color: '#0D2D27',
    fontSize: 11,
    fontWeight: '900',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2D27',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  qtyBtn: {
    padding: 3,
  },
  qtyNum: {
    color: theme.colors.accentLime,
    fontSize: 11,
    fontWeight: '900',
    minWidth: 14,
    textAlign: 'center',
  },
});
