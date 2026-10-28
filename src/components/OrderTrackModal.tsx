import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/tokens';

interface OrderTrackModalProps {
  visible: boolean;
  onClose: () => void;
  orderNumber: string;
  storeName: string;
}

export const OrderTrackModal: React.FC<OrderTrackModalProps> = ({
  visible,
  onClose,
  orderNumber,
  storeName,
}) => {
  const steps = [
    { title: 'Order Confirmed', time: 'Just now', done: true },
    { title: 'Packing at Store', time: 'In progress', done: true, active: true },
    { title: 'Out for 15-Min Delivery', time: '~8 mins', done: false },
    { title: 'Arrived at Doorstep', time: '~15 mins', done: false },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.badge}>⚡ 15-MINUTE SUPERFAST</Text>
              <Text style={styles.title}>Order on the way!</Text>
              <Text style={styles.orderId}>Order #{orderNumber}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* SLA Timer */}
          <View style={styles.timerBox}>
            <View>
              <Text style={styles.timerLabel}>Arriving In Approximately</Text>
              <Text style={styles.timerVal}>14 Mins</Text>
            </View>
            <View style={styles.storeBadge}>
              <Text style={styles.storeText}>Dispatching: {storeName}</Text>
            </View>
          </View>

          {/* Stepper */}
          <View style={styles.stepperContainer}>
            {steps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={styles.bulletCol}>
                  <View
                    style={[
                      styles.bullet,
                      step.done ? styles.bulletDone : styles.bulletPending,
                      step.active && styles.bulletActive,
                    ]}
                  >
                    {step.done ? (
                      <Text style={styles.bulletCheck}>✓</Text>
                    ) : (
                      <View style={styles.bulletInner} />
                    )}
                  </View>
                  {idx < steps.length - 1 && (
                    <View
                      style={[
                        styles.connector,
                        step.done ? styles.connectorDone : styles.connectorPending,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, step.active && styles.stepTitleActive]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepTime}>{step.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Delivery partner info */}
          <View style={styles.riderBox}>
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>🛵</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.riderName}>Murugan S. (Hero Electric)</Text>
              <Text style={styles.riderRating}>★ 4.9 • 850+ deliveries in Tirunelveli</Text>
            </View>
          </View>

          {/* Done CTA */}
          <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 35, 31, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primaryTeal,
    backgroundColor: theme.colors.accentLimeSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  orderId: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  timerBox: {
    backgroundColor: theme.colors.primaryTeal,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '600',
  },
  timerVal: {
    color: theme.colors.accentLime,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  storeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 140,
  },
  storeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  stepperContainer: {
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  bullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletDone: {
    backgroundColor: theme.colors.primaryTeal,
  },
  bulletPending: {
    backgroundColor: '#E5E8E2',
  },
  bulletActive: {
    borderWidth: 2,
    borderColor: theme.colors.accentLime,
  },
  bulletCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  bulletInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8C948F',
  },
  connector: {
    width: 2,
    height: 18,
    marginVertical: 2,
  },
  connectorDone: {
    backgroundColor: theme.colors.primaryTeal,
  },
  connectorPending: {
    backgroundColor: '#E5E8E2',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textCharcoal,
  },
  stepTitleActive: {
    color: theme.colors.primaryTeal,
    fontWeight: '800',
  },
  stepTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  riderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgMuted,
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  riderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderAvatarText: {
    fontSize: 18,
  },
  riderName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  riderRating: {
    fontSize: 11,
    color: theme.colors.textSlate,
    marginTop: 1,
  },
  doneBtn: {
    backgroundColor: theme.colors.primaryTeal,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: theme.colors.accentLime,
    fontWeight: '800',
    fontSize: 14,
  },
});
