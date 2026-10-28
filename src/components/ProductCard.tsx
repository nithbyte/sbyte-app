import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ProductSummary } from '@sbyte/shared-types';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/tokens';

interface ProductCardProps {
  product: ProductSummary;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAdd,
  onRemove,
}) => {
  const currentPrice = product.discountPrice ?? product.basePrice;
  const hasDiscount = product.discountPrice && product.discountPrice < product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - product.discountPrice!) / product.basePrice) * 100)
    : 0;

  return (
    <View style={styles.card}>
      {/* Product Image & Badges Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}

        {/* Package Size Badge */}
        <View style={styles.sizeBadge}>
          <Text style={styles.sizeText}>{product.packageSize}</Text>
        </View>

        {/* Veg classification indicator (standard Indian grocery symbol) */}
        <View style={styles.vegIndicator}>
          <View style={styles.vegDot} />
        </View>
      </View>

      {/* Info Body */}
      <View style={styles.content}>
        <View style={styles.headerInfo}>
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          {product.tamilName ? (
            <Text style={styles.tamilName} numberOfLines={1}>
              {product.tamilName}
            </Text>
          ) : null}
        </View>

        {/* Pricing and Action row */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>₹{currentPrice}</Text>
              {hasDiscount && (
                <Text style={styles.oldPrice}>₹{product.basePrice}</Text>
              )}
            </View>
            <Text style={styles.deliverySla}>⚡ 15 mins</Text>
          </View>

          {/* Add / Stepper Button */}
          {quantity === 0 ? (
            <TouchableOpacity
              onPress={onAdd}
              style={styles.addButton}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>ADD</Text>
              <Ionicons name="add" size={14} color="#0D2D27" />
            </TouchableOpacity>
          ) : (
            <View style={styles.stepper}>
              <TouchableOpacity onPress={onRemove} style={styles.stepBtn} activeOpacity={0.7}>
                <Ionicons name="remove" size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.stepQty}>{quantity}</Text>
              <TouchableOpacity onPress={onAdd} style={styles.stepBtn} activeOpacity={0.7}>
                <Ionicons name="add" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7ECE9',
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#123D35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    height: 124,
    backgroundColor: '#F5F7F5',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0D2D27',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: theme.colors.accentLime,
  },
  discountText: {
    color: theme.colors.accentLime,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  vegIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.2,
    borderColor: '#1E8E3E',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E8E3E',
  },
  sizeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#D8DFDA',
  },
  sizeText: {
    color: '#2B3934',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 10,
    justifyContent: 'space-between',
    minHeight: 126,
  },
  headerInfo: {
    flex: 1,
  },
  brand: {
    fontSize: 9,
    color: '#8A9993',
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16231F',
    marginTop: 2,
    lineHeight: 17,
  },
  tamilName: {
    fontSize: 11,
    color: '#123D35',
    fontWeight: '600',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F3F1',
  },
  priceContainer: {
    flex: 1,
    marginRight: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#102A24',
  },
  oldPrice: {
    fontSize: 11,
    color: '#8F9B96',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  deliverySla: {
    fontSize: 9,
    color: '#123D35',
    fontWeight: '700',
    marginTop: 1,
  },
  addButton: {
    backgroundColor: theme.colors.accentLime,
    borderWidth: 1,
    borderColor: 'rgba(18, 61, 53, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    shadowColor: '#C8F169',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: '#0D2D27',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2D27',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  stepBtn: {
    padding: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    color: theme.colors.accentLime,
    fontSize: 12,
    fontWeight: '900',
    minWidth: 16,
    textAlign: 'center',
  },
});
