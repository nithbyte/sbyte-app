import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ProductSummary } from '@sbyte/shared-types';
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

  return (
    <View style={styles.card}>
      {/* Product Image & Size Tag */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.sizeBadge}>
          <Text style={styles.sizeText}>{product.packageSize}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.content}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {product.tamilName && (
          <Text style={styles.tamilName} numberOfLines={1}>
            {product.tamilName}
          </Text>
        )}

        {/* Pricing and Action row */}
        <View style={styles.footerRow}>
          <View>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>₹{currentPrice}</Text>
              {product.discountPrice && (
                <Text style={styles.oldPrice}>₹{product.basePrice}</Text>
              )}
            </View>
          </View>

          {/* Add / Stepper Button */}
          {quantity === 0 ? (
            <TouchableOpacity
              onPress={onAdd}
              style={styles.addButton}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stepper}>
              <TouchableOpacity onPress={onRemove} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepQty}>{quantity}</Text>
              <TouchableOpacity onPress={onAdd} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>+</Text>
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
    width: '48%',
    marginBottom: 14,
    shadowColor: '#19231F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    height: 120,
    backgroundColor: theme.colors.bgMuted,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  sizeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(18, 61, 53, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sizeText: {
    color: theme.colors.accentLime,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textInk,
    marginTop: 2,
  },
  tamilName: {
    fontSize: 11,
    color: theme.colors.primaryTeal,
    fontWeight: '600',
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  oldPrice: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: theme.colors.primarySurface,
    borderWidth: 1,
    borderColor: theme.colors.primaryTeal,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addButtonText: {
    color: theme.colors.primaryTeal,
    fontSize: 12,
    fontWeight: '800',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryTeal,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepQty: {
    color: theme.colors.accentLime,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 4,
  },
});
