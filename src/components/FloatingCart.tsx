import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/tokens';

interface FloatingCartProps {
  totalItems: number;
  totalAmount: number;
  onPress: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({
  totalItems,
  totalAmount,
  onPress,
}) => {
  if (totalItems === 0) return null;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={onPress} style={styles.bar} activeOpacity={0.9}>
        <View style={styles.left}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
          <View>
            <Text style={styles.priceText}>₹{totalAmount}</Text>
            <Text style={styles.subtext}>Plus taxes & handling</Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  bar: {
    backgroundColor: theme.colors.primaryTeal,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0D2D27',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 105, 0.4)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: theme.colors.accentLime,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: theme.colors.primaryTeal,
    fontWeight: '900',
    fontSize: 13,
  },
  priceText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.accentLime,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  viewCartText: {
    color: theme.colors.primaryTeal,
    fontWeight: '800',
    fontSize: 13,
  },
  arrow: {
    color: theme.colors.primaryTeal,
    fontWeight: '900',
    fontSize: 14,
  },
});
