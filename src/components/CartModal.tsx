import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ProductSummary } from '@sbyte/shared-types';
import { theme } from '../theme/tokens';

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
  cartItems: { product: ProductSummary; quantity: number }[];
  currentLocality: string;
  onPlaceOrder: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  visible,
  onClose,
  cartItems,
  currentLocality,
  onPlaceOrder,
}) => {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.discountPrice ?? item.product.basePrice) * item.quantity,
    0,
  );

  const freeDeliveryThreshold = 199;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : 25;
  const handlingFee = 5;
  const grandTotal = subtotal + deliveryFee + handlingFee;
  const amountNeededForFree = freeDeliveryThreshold - subtotal;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Your Basket</Text>
              <Text style={styles.subtitle}>
                Delivering in 15 mins to {currentLocality}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Free Delivery Meter */}
          <View style={styles.meterContainer}>
            {isFreeDelivery ? (
              <Text style={styles.meterUnlocked}>
                🎉 You have unlocked <Text style={{ fontWeight: '800' }}>FREE Delivery</Text>!
              </Text>
            ) : (
              <Text style={styles.meterProgress}>
                Add <Text style={{ fontWeight: '800' }}>₹{amountNeededForFree}</Text> more for FREE Delivery!
              </Text>
            )}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` },
                ]}
              />
            </View>
          </View>

          {/* Items & Bill */}
          <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</Text>
            {cartItems.map(({ product, quantity }) => {
              const price = product.discountPrice ?? product.basePrice;
              return (
                <View key={product.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{product.name}</Text>
                    {product.tamilName && (
                      <Text style={styles.itemTamil}>{product.tamilName}</Text>
                    )}
                    <Text style={styles.itemUnit}>
                      {product.packageSize} • ₹{price} each
                    </Text>
                  </View>
                  <Text style={styles.itemQuantity}>Qty: {quantity}</Text>
                  <Text style={styles.itemTotal}>₹{quantity * price}</Text>
                </View>
              );
            })}

            {/* Bill Summary */}
            <View style={styles.billBox}>
              <Text style={styles.billTitle}>Bill Breakdown</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Subtotal</Text>
                <Text style={styles.billVal}>₹{subtotal}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee (15m SLA)</Text>
                <Text style={styles.billVal}>
                  {deliveryFee === 0 ? (
                    <Text style={{ color: theme.colors.success, fontWeight: '700' }}>FREE</Text>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Handling & Packaging</Text>
                <Text style={styles.billVal}>₹{handlingFee}</Text>
              </View>
              <View style={[styles.billRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>To Pay</Text>
                <Text style={styles.grandTotalVal}>₹{grandTotal}</Text>
              </View>
            </View>

            {/* Delivery address & note */}
            <View style={styles.addressBox}>
              <Text style={styles.addressHeader}>📍 Delivering From</Text>
              <Text style={styles.addressText}>
                S BYTE Mini-Supermarket (Palayamkottai Hub)
              </Text>
              <Text style={styles.addressSub}>
                Estimated Arrival: 15–18 Mins • Contactless Delivery
              </Text>
            </View>
          </ScrollView>

          {/* Checkout CTA */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerTotal}>₹{grandTotal}</Text>
              <Text style={styles.footerPayment}>UPI / Cash on Delivery</Text>
            </View>
            <TouchableOpacity
              onPress={onPlaceOrder}
              style={styles.checkoutBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutBtnText}>Place 15-Min Order</Text>
              <Text style={styles.checkoutBtnArrow}>⚡</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSlate,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  meterContainer: {
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  meterUnlocked: {
    fontSize: 12,
    color: theme.colors.primaryTeal,
    fontWeight: '600',
  },
  meterProgress: {
    fontSize: 12,
    color: theme.colors.textCharcoal,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E5E8E2',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primaryTeal,
  },
  itemList: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textInk,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
    gap: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  itemTamil: {
    fontSize: 11,
    color: theme.colors.primaryTeal,
    fontWeight: '600',
  },
  itemUnit: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  itemQuantity: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSlate,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textInk,
    width: 60,
    textAlign: 'right',
  },
  billBox: {
    backgroundColor: '#FAFAF8',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  billTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textInk,
    marginBottom: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  billLabel: {
    fontSize: 13,
    color: theme.colors.textSlate,
  },
  billVal: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textInk,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderColor: theme.colors.borderLight,
    marginTop: 8,
    paddingTop: 8,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  grandTotalVal: {
    fontSize: 17,
    fontWeight: '900',
    color: theme.colors.primaryTeal,
  },
  addressBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: theme.colors.primarySurface,
    borderRadius: 12,
  },
  addressHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryTeal,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textInk,
    marginTop: 2,
  },
  addressSub: {
    fontSize: 11,
    color: theme.colors.textSlate,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.textInk,
  },
  footerPayment: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  checkoutBtn: {
    backgroundColor: theme.colors.accentLime,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkoutBtnText: {
    color: theme.colors.primaryTeal,
    fontWeight: '900',
    fontSize: 14,
  },
  checkoutBtnArrow: {
    fontSize: 14,
  },
});
