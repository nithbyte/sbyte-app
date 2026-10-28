import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/tokens';
import { StoreConflict } from '../context/CartContext';

interface StoreSwitchModalProps {
  conflict: StoreConflict | null;
  onResolve: (replace: boolean) => void;
}

export const StoreSwitchModal: React.FC<StoreSwitchModalProps> = ({
  conflict,
  onResolve,
}) => {
  if (!conflict) return null;

  return (
    <Modal visible={!!conflict} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🏬</Text>
          </View>

          <Text style={styles.title}>Switch Fulfillment Store?</Text>

          <Text style={styles.message}>
            Your cart contains items from{' '}
            <Text style={styles.boldStore}>
              {conflict.existingStoreName || 'your current store'}
            </Text>
            .
            {'\n\n'}
            Adding{' '}
            <Text style={styles.boldProduct}>{conflict.pendingProduct.name}</Text> from{' '}
            <Text style={styles.boldStore}>
              {conflict.requestedStoreName || 'the new store'}
            </Text>{' '}
            will reset your existing cart items to ensure single-store 15-minute express delivery.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.replaceButton}
              onPress={() => onResolve(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.replaceButtonText}>Reset & Add New Item</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => onResolve(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Keep Current Cart</Text>
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
    backgroundColor: 'rgba(25, 35, 31, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accentLimeSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textInk,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textCharcoal,
    textAlign: 'center',
    marginBottom: 24,
  },
  boldStore: {
    fontWeight: '700',
    color: theme.colors.primaryTeal,
  },
  boldProduct: {
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  buttonGroup: {
    width: '100%',
    gap: 10,
  },
  replaceButton: {
    backgroundColor: theme.colors.primaryTeal,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  replaceButtonText: {
    color: theme.colors.accentLime,
    fontSize: 14,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: theme.colors.bgMuted,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.textSlate,
    fontSize: 13,
    fontWeight: '600',
  },
});
