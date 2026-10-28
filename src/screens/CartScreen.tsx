import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/tokens';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';

interface CartScreenProps {
  onOpenCheckout: () => void;
  onOpenAddressModal: () => void;
  onNavigateHome: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onOpenCheckout,
  onOpenAddressModal,
  onNavigateHome,
}) => {
  const { currentStore, currentAddress, deliveryInstructions } = useLocation();
  const {
    cartItemList,
    totalItems,
    subtotal,
    deliveryFee,
    handlingFee,
    discount,
    totalAmount,
    freeDeliveryNeeded,
    couponCode,
    couponError,
    appliedCouponDetails,
    addToCart,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApply = async (codeToApply?: string) => {
    const code = codeToApply || inputCoupon;
    if (!code) return;
    setIsApplyingCoupon(true);
    await applyCoupon(code);
    setIsApplyingCoupon(false);
  };

  if (cartItemList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySub}>
            Explore fresh vegetables, groceries, snacks, and stationery from S BYTE.
          </Text>
          <TouchableOpacity style={styles.shopNowBtn} onPress={onNavigateHome}>
            <Text style={styles.shopNowBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / 299) * 100));

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.title}>Your Basket ({totalItems} items)</Text>
        <Text style={styles.subTitle}>
          Fulfilling Store: {currentStore?.name || 'S BYTE Palayamkottai Flagship'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Free Delivery Meter */}
        <View style={styles.freeDeliveryCard}>
          <View style={styles.meterRow}>
            <Text style={styles.meterIcon}>🚚</Text>
            <Text style={styles.meterText}>
              {freeDeliveryNeeded === 0
                ? '🎉 Congratulations! You have unlocked FREE Delivery.'
                : `Add ₹${freeDeliveryNeeded} more to unlock FREE Delivery.`}
            </Text>
          </View>
          <View style={styles.meterTrack}>
            <View style={[styles.meterFill, { width: `${freeDeliveryProgress}%` }]} />
          </View>
        </View>

        {/* Cart Item Cards */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionHeading}>Items in Cart</Text>
          {cartItemList.map((it) => {
            const price = it.product.discountPrice ?? it.product.basePrice;
            const itemTotal = price * it.quantity;

            return (
              <View key={it.product.id} style={styles.cartRow}>
                <Image source={{ uri: it.product.imageUrl }} style={styles.cartImg} />
                <View style={styles.cartDetails}>
                  <Text style={styles.prodName}>{it.product.name}</Text>
                  {it.product.tamilName && (
                    <Text style={styles.prodTamil}>{it.product.tamilName}</Text>
                  )}
                  <Text style={styles.prodPack}>{it.product.packageSize}</Text>
                  <Text style={styles.prodPrice}>₹{price}</Text>
                </View>

                {/* Qty Control */}
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => removeFromCart(it.product.id)}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{it.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => addToCart(it.product)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.rowTotal}>₹{itemTotal}</Text>
              </View>
            );
          })}
        </View>

        {/* Delivery Address & Instructions */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <Text style={styles.sectionHeading}>Delivery Address</Text>
            <TouchableOpacity onPress={onOpenAddressModal}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addrRecipient}>{currentAddress.recipientName} ({currentAddress.phone})</Text>
          <Text style={styles.addrText}>{currentAddress.streetAddress}, {currentAddress.locality}</Text>
          {deliveryInstructions ? (
            <Text style={styles.instructionNote}>Note: "{deliveryInstructions}"</Text>
          ) : null}
        </View>

        {/* Coupons & Offers */}
        <View style={styles.couponCard}>
          <Text style={styles.sectionHeading}>Offers & Coupons</Text>

          {appliedCouponDetails ? (
            <View style={styles.appliedCouponRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.appliedCode}>🎉 {appliedCouponDetails.code}</Text>
                <Text style={styles.appliedDesc}>{appliedCouponDetails.discountText}</Text>
              </View>
              <TouchableOpacity onPress={removeCoupon} style={styles.removeCouponBtn}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter Promo Code"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="characters"
                  value={inputCoupon}
                  onChangeText={setInputCoupon}
                />
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => handleApply()}
                  disabled={isApplyingCoupon}
                >
                  {isApplyingCoupon ? (
                    <ActivityIndicator size="small" color={theme.colors.primaryTealDark} />
                  ) : (
                    <Text style={styles.applyBtnText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>

              {couponError && <Text style={styles.couponError}>⚠️ {couponError}</Text>}

              {/* Coupon Suggestions */}
              <View style={styles.couponChips}>
                <TouchableOpacity
                  style={styles.couponChip}
                  onPress={() => handleApply('SBYTE100')}
                >
                  <Text style={styles.couponChipCode}>SBYTE100</Text>
                  <Text style={styles.couponChipDesc}>Flat ₹100 Off on ₹499+</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.couponChip}
                  onPress={() => handleApply('SUPERFAST15')}
                >
                  <Text style={styles.couponChipCode}>SUPERFAST15</Text>
                  <Text style={styles.couponChipDesc}>15% Off on ₹199+</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Detailed Bill Breakdown */}
        <View style={styles.billCard}>
          <Text style={styles.sectionHeading}>Bill Breakdown</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billVal}>₹{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Charge</Text>
            <Text style={deliveryFee === 0 ? styles.freeText : styles.billVal}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Handling & Packaging</Text>
            <Text style={styles.billVal}>₹{handlingFee}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.discountLabel}>Coupon Discount</Text>
              <Text style={styles.discountVal}>- ₹{discount}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalVal}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom Checkout Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.payLabel}>Total to Pay</Text>
          <Text style={styles.payVal}>₹{totalAmount}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={onOpenCheckout}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
        </TouchableOpacity>
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
    paddingBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  subTitle: {
    fontSize: 11,
    color: '#AABEB6',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgCream,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  emptySub: {
    fontSize: 13,
    color: theme.colors.textSlate,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  shopNowBtn: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopNowBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
  freeDeliveryCard: {
    backgroundColor: '#F2FBDD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C8F169',
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  meterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  meterText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryTealDark,
    flex: 1,
  },
  meterTrack: {
    height: 6,
    backgroundColor: 'rgba(18, 61, 53, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: theme.colors.primaryTeal,
  },
  itemsCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textInk,
    marginBottom: 12,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  cartImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.colors.bgMuted,
  },
  cartDetails: {
    flex: 1,
    marginLeft: 10,
  },
  prodName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  prodTamil: {
    fontSize: 11,
    color: theme.colors.primaryTeal,
  },
  prodPack: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  prodPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryTeal,
    marginTop: 2,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryTeal,
    borderRadius: 8,
    paddingHorizontal: 2,
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
  qtyVal: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 4,
  },
  rowTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textInk,
    marginLeft: 12,
    minWidth: 44,
    textAlign: 'right',
  },
  deliveryCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeLink: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryTeal,
  },
  addrRecipient: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textInk,
    marginTop: 6,
  },
  addrText: {
    fontSize: 12,
    color: theme.colors.textCharcoal,
    marginTop: 2,
  },
  instructionNote: {
    fontSize: 11,
    color: theme.colors.primaryTeal,
    fontStyle: 'italic',
    marginTop: 4,
  },
  couponCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.colors.textInk,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  applyBtn: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
  couponError: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 6,
    fontWeight: '600',
  },
  couponChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  couponChip: {
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  couponChipCode: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primaryTeal,
  },
  couponChipDesc: {
    fontSize: 9,
    color: theme.colors.textSlate,
    marginTop: 1,
  },
  appliedCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2FBDD',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8F169',
  },
  appliedCode: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
  appliedDesc: {
    fontSize: 10,
    color: theme.colors.textCharcoal,
  },
  removeCouponBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeCouponText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  billCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  billLabel: {
    fontSize: 12,
    color: theme.colors.textSlate,
  },
  billVal: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textInk,
  },
  freeText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.success,
  },
  discountLabel: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '700',
  },
  discountVal: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: '900',
    color: theme.colors.primaryTeal,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: theme.colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  payLabel: {
    fontSize: 11,
    color: theme.colors.textSlate,
  },
  payVal: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.primaryTeal,
  },
  checkoutBtn: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  checkoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
});
