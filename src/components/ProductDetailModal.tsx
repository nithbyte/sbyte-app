import React from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/tokens';
import { ProductSummary } from '@sbyte/shared-types';
import { useCart } from '../context/CartContext';
import { MOBILE_PRODUCTS } from '../data/mockData';

interface ProductDetailModalProps {
  product: ProductSummary | null;
  visible: boolean;
  onClose: () => void;
  onSelectRelated: (p: ProductSummary) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  visible,
  onClose,
  onSelectRelated,
}) => {
  const { cart, addToCart, removeFromCart } = useCart();

  if (!product) return null;

  const currentQty = cart[product.id] || 0;
  const price = product.discountPrice ?? product.basePrice;
  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.basePrice;
  const discountPct = hasDiscount
    ? Math.round(((product.basePrice - (product.discountPrice || 0)) / product.basePrice) * 100)
    : 0;

  const related = MOBILE_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 4);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.dragPill} />

          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#16231F" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
            {/* Image Hero */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
              {hasDiscount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discountPct}% OFF</Text>
                </View>
              )}
              <View style={styles.vegBadge}>
                <View style={styles.vegDot} />
              </View>
            </View>

            {/* Title & Brand */}
            <View style={styles.titleSection}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.name}>{product.name}</Text>
              {product.tamilName && (
                <Text style={styles.tamilName}>{product.tamilName}</Text>
              )}
              <View style={styles.unitPill}>
                <Text style={styles.unitText}>{product.packageSize}</Text>
              </View>
            </View>

            {/* Pricing */}
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.currentPrice}>₹{price}</Text>
                {hasDiscount && (
                  <Text style={styles.mrpText}>
                    MRP <Text style={styles.strikethrough}>₹{product.basePrice}</Text>
                  </Text>
                )}
              </View>

              {/* Add / Qty Controller */}
              {currentQty === 0 ? (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addToCart(product)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="cart" size={14} color="#0D2D27" style={{ marginRight: 4 }} />
                  <Text style={styles.addButtonText}>ADD TO CART</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => removeFromCart(product.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.qtyNumber}>{currentQty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => addToCart(product)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* SLA Delivery Guarantee */}
            <View style={styles.slaCard}>
              <View style={styles.slaIconWrap}>
                <Ionicons name="flash" size={16} color="#0D2D27" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.slaTitle}>Express 15-Minute Delivery</Text>
                <Text style={styles.slaSubtitle}>
                  Picked fresh from your nearest Tirunelveli mini-supermarket
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descSection}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>

            {/* Related items */}
            {related.length > 0 && (
              <View style={styles.relatedSection}>
                <Text style={styles.sectionTitle}>You May Also Like</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedScroll}>
                  {related.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      style={styles.relatedCard}
                      onPress={() => onSelectRelated(r)}
                    >
                      <Image source={{ uri: r.imageUrl }} style={styles.relatedImg} />
                      <Text style={styles.relatedName} numberOfLines={1}>
                        {r.name}
                      </Text>
                      <Text style={styles.relatedPrice}>
                        ₹{r.discountPrice ?? r.basePrice}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 35, 31, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
  },
  dragPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDE2DC',
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    alignItems: 'flex-end',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: theme.colors.textInk,
    fontWeight: '700',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.bgMuted,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: theme.colors.primaryTeal,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: theme.colors.accentLime,
    fontSize: 11,
    fontWeight: '800',
  },
  vegBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#1E8E3E',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E8E3E',
  },
  titleSection: {
    marginBottom: 16,
  },
  brand: {
    fontSize: 12,
    color: theme.colors.textSlate,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textInk,
    marginTop: 2,
  },
  tamilName: {
    fontSize: 15,
    color: theme.colors.primaryTeal,
    fontWeight: '600',
    marginTop: 2,
  },
  unitPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textCharcoal,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.primaryTeal,
  },
  mrpText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: theme.colors.primaryTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryTeal,
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  qtyBtnText: {
    color: theme.colors.accentLime,
    fontSize: 18,
    fontWeight: '800',
  },
  qtyNumber: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 10,
  },
  slaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2FBDD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  slaIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accentLime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
  slaSubtitle: {
    fontSize: 11,
    color: theme.colors.textCharcoal,
  },
  descSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textInk,
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    color: theme.colors.textCharcoal,
    lineHeight: 20,
  },
  relatedSection: {
    marginBottom: 20,
  },
  relatedScroll: {
    marginTop: 8,
  },
  relatedCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 12,
    padding: 8,
  },
  relatedImg: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  relatedName: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  relatedPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primaryTeal,
    marginTop: 2,
  },
});
