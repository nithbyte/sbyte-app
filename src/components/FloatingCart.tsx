import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <TouchableOpacity onPress={onPress} style={styles.bar} activeOpacity={0.92}>
        <View style={styles.left}>
          <View style={styles.badgeWrap}>
            <Ionicons name="bag" size={16} color={theme.colors.primaryTealDark} />
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
          <View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>₹{totalAmount}</Text>
              <View style={styles.dot} />
              <Text style={styles.etaText}>15 MINS</Text>
            </View>
            <Text style={styles.subtext}>Extra discounts may apply at checkout</Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Ionicons name="arrow-forward" size={15} color={theme.colors.primaryTealDark} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
    zIndex: 99,
  },
  bar: {
    backgroundColor: '#0D2D27',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(200, 241, 105, 0.4)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  badgeWrap: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    color: theme.colors.primaryTealDark,
    fontWeight: '900',
    fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  etaText: {
    color: theme.colors.accentLime,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accentLime,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  viewCartText: {
    color: theme.colors.primaryTealDark,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
