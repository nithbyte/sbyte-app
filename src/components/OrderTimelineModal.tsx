import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme/tokens';
import { OrderSummary, OrderStatus } from '@sbyte/shared-types';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { MOBILE_PRODUCTS } from '../data/mockData';

interface OrderTimelineModalProps {
  order: OrderSummary | null;
  visible: boolean;
  onClose: () => void;
  onOrderUpdated?: (updated: OrderSummary) => void;
  onOpenSupport?: (orderId: string) => void;
}

export const OrderTimelineModal: React.FC<OrderTimelineModalProps> = ({
  order,
  visible,
  onClose,
  onOrderUpdated,
  onOpenSupport,
}) => {
  const { addToCart } = useCart();
  const [isCancelling, setIsCancelling] = useState(false);

  if (!order) return null;

  const steps = [
    { key: OrderStatus.CONFIRMED, label: 'Order Confirmed', time: '1 min ago' },
    { key: OrderStatus.PACKING, label: 'Packing at Store', time: 'In progress' },
    { key: OrderStatus.READY_FOR_PICKUP, label: 'Ready for Rider', time: 'Upcoming' },
    { key: OrderStatus.OUT_FOR_DELIVERY, label: 'Rider Out for Delivery', time: 'Upcoming' },
    { key: OrderStatus.DELIVERED, label: 'Delivered at Doorstep', time: 'ETA 12 mins' },
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    if (order.status === OrderStatus.CANCELLED) return 'cancelled';

    const orderHierarchy: Record<OrderStatus, number> = {
      [OrderStatus.PENDING]: 0,
      [OrderStatus.CONFIRMED]: 1,
      [OrderStatus.PACKING]: 2,
      [OrderStatus.READY_FOR_PICKUP]: 3,
      [OrderStatus.OUT_FOR_DELIVERY]: 4,
      [OrderStatus.DELIVERED]: 5,
      [OrderStatus.CANCELLED]: -1,
    };

    const currentRank = orderHierarchy[order.status] ?? 1;
    const stepRank = orderHierarchy[stepKey] ?? 1;

    if (currentRank > stepRank) return 'completed';
    if (currentRank === stepRank) return 'active';
    return 'pending';
  };

  const canCancel =
    order.status === OrderStatus.PENDING ||
    order.status === OrderStatus.CONFIRMED;

  const handleCancelOrder = async () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? Stock reservation will be returned to the store.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              const updated = await api.cancelOrder(order.id, 'Customer requested cancellation from mobile app');
              if (onOrderUpdated) onOrderUpdated(updated);
              Alert.alert('Order Cancelled', 'Your order was successfully cancelled.');
            } catch (e: any) {
              // Local simulation update if server is offline
              const cancelledOrder = { ...order, status: OrderStatus.CANCELLED };
              if (onOrderUpdated) onOrderUpdated(cancelledOrder);
              Alert.alert('Order Cancelled', 'Your order was cancelled.');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
    );
  };

  const handleReorder = async () => {
    let count = 0;
    for (const item of order.items) {
      // Find product in catalog
      const match = MOBILE_PRODUCTS.find(
        (p) => p.name.toLowerCase() === item.productName.toLowerCase(),
      );
      if (match) {
        await addToCart(match);
        count++;
      }
    }
    Alert.alert('Reordered', `${count} item(s) added back to your cart!`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.dragPill} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.storeSub}>
                {order.storeName || 'S BYTE Store'} • Express 15-Min Delivery
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
            {/* Live Status Hero */}
            <View
              style={[
                styles.statusHero,
                order.status === OrderStatus.CANCELLED ? styles.cancelledHero : styles.activeHero,
              ]}
            >
              <Text style={styles.statusHeroIcon}>
                {order.status === OrderStatus.CANCELLED
                  ? '❌'
                  : order.status === OrderStatus.DELIVERED
                  ? '🎉'
                  : '⚡'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusHeroTitle}>
                  {order.status === OrderStatus.CANCELLED
                    ? 'Order Cancelled'
                    : order.status === OrderStatus.DELIVERED
                    ? 'Order Delivered!'
                    : 'Arriving in ~12-15 Mins'}
                </Text>
                <Text style={styles.statusHeroSubtitle}>
                  {order.status === OrderStatus.CANCELLED
                    ? 'Stock reservation released. If paid online, refund is initiated.'
                    : 'Rider is picking fresh stock at Palayamkottai Mini-Supermarket'}
                </Text>
              </View>
            </View>

            {/* Timeline Stepper */}
            {order.status !== OrderStatus.CANCELLED && (
              <View style={styles.stepperCard}>
                <Text style={styles.cardHeading}>Tracking Timeline</Text>
                {steps.map((st, idx) => {
                  const state = getStepStatus(st.key);
                  const isLast = idx === steps.length - 1;

                  return (
                    <View key={st.key} style={styles.stepRow}>
                      <View style={styles.stepperColumn}>
                        <View
                          style={[
                            styles.stepperDot,
                            state === 'completed' && styles.completedDot,
                            state === 'active' && styles.activeDot,
                          ]}
                        >
                          {state === 'completed' ? (
                            <Text style={styles.dotCheck}>✓</Text>
                          ) : state === 'active' ? (
                            <View style={styles.activeDotInner} />
                          ) : null}
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.stepperLine,
                              state === 'completed' && styles.completedLine,
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.stepContent}>
                        <Text
                          style={[
                            styles.stepTitle,
                            (state === 'completed' || state === 'active') && styles.stepTitleDone,
                          ]}
                        >
                          {st.label}
                        </Text>
                        <Text style={styles.stepSubtitle}>
                          {state === 'completed' ? 'Completed' : st.time}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Items in Order */}
            <View style={styles.stepperCard}>
              <Text style={styles.cardHeading}>Items in Order ({order.items.length})</Text>
              {order.items.map((it) => (
                <View key={it.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{it.productName}</Text>
                    {it.tamilName && (
                      <Text style={styles.itemTamil}>{it.tamilName}</Text>
                    )}
                    <Text style={styles.itemPack}>{it.packageSize} • Qty: {it.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{it.totalPrice}</Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Paid ({order.paymentMethod})</Text>
                <Text style={styles.totalVal}>₹{order.totalAmount}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonGroup}>
              {canCancel && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancelOrder}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator color="#DC2626" />
                  ) : (
                    <Text style={styles.cancelBtnText}>Cancel Order</Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.reorderBtn} onPress={handleReorder}>
                <Text style={styles.reorderBtnText}>🔄 Reorder Items</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportBtn}
                onPress={() => onOpenSupport && onOpenSupport(order.id)}
              >
                <Text style={styles.supportBtnText}>💬 Need Help with this Order?</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 35, 31, 0.65)',
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
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.primaryTeal,
  },
  storeSub: {
    fontSize: 12,
    color: theme.colors.textSlate,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: theme.colors.textInk,
    fontWeight: '700',
  },
  statusHero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  activeHero: {
    backgroundColor: '#F2FBDD',
    borderWidth: 1,
    borderColor: '#C8F169',
  },
  cancelledHero: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  statusHeroIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  statusHeroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  statusHeroSubtitle: {
    fontSize: 11,
    color: theme.colors.textCharcoal,
    marginTop: 2,
  },
  stepperCard: {
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textInk,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepperColumn: {
    alignItems: 'center',
    width: 28,
  },
  stepperDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedDot: {
    backgroundColor: theme.colors.primaryTeal,
  },
  activeDot: {
    backgroundColor: theme.colors.accentLime,
    borderWidth: 2,
    borderColor: theme.colors.primaryTeal,
  },
  activeDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primaryTealDark,
  },
  dotCheck: {
    color: theme.colors.accentLime,
    fontSize: 10,
    fontWeight: '900',
  },
  stepperLine: {
    width: 2,
    height: 32,
    backgroundColor: '#D1D5DB',
    marginVertical: 2,
  },
  completedLine: {
    backgroundColor: theme.colors.primaryTeal,
  },
  stepContent: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSlate,
  },
  stepTitleDone: {
    color: theme.colors.textInk,
    fontWeight: '700',
  },
  stepSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  itemTamil: {
    fontSize: 11,
    color: theme.colors.primaryTeal,
  },
  itemPack: {
    fontSize: 11,
    color: theme.colors.textSlate,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textInk,
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
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  totalVal: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.primaryTeal,
  },
  actionButtonGroup: {
    gap: 10,
    marginBottom: 20,
  },
  cancelBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  reorderBtn: {
    backgroundColor: theme.colors.primaryTeal,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  reorderBtnText: {
    color: theme.colors.accentLime,
    fontSize: 13,
    fontWeight: '800',
  },
  supportBtn: {
    backgroundColor: theme.colors.bgMuted,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  supportBtnText: {
    color: theme.colors.textSlate,
    fontSize: 13,
    fontWeight: '600',
  },
});
