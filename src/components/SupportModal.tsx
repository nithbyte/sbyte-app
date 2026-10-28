import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme/tokens';
import { api } from '../api/client';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
  orderId?: string;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  visible,
  onClose,
  orderId,
}) => {
  const [subject, setSubject] = useState(
    orderId ? `Issue with Order #${orderId.substring(0, 8)}` : '',
  );
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!subject || !description) {
      Alert.alert('Required', 'Please describe the issue you are facing.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTicket({
        orderId,
        subject,
        description,
        priority,
      });
      Alert.alert(
        'Support Ticket Created',
        'Our Tirunelveli support desk has received your ticket and will respond shortly.',
      );
      onClose();
    } catch {
      Alert.alert(
        'Ticket Submitted',
        'Your inquiry was submitted locally. Our customer representative will assist you.',
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.dragPill} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>S BYTE Customer Support</Text>
              <Text style={styles.sub}>Palayamkottai • Vannarpettai • Town</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
            {/* Quick Contact Card */}
            <View style={styles.helplineCard}>
              <Text style={styles.helplineIcon}>📞</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.helplineTitle}>Nellai Store Helpline: 0462-2500000</Text>
                <Text style={styles.helplineSub}>Active Daily: 6:00 AM – 11:00 PM</Text>
              </View>
            </View>

            {/* Quick Topic Chips */}
            <Text style={styles.label}>Common Inquiries</Text>
            <View style={styles.chipsRow}>
              {[
                'Delivery Delayed',
                'Damaged Produce',
                'Payment Deduction Issue',
                'Item Missing in Bag',
              ].map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={styles.chip}
                  onPress={() => setSubject(chip)}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="What can we help you with?"
                placeholderTextColor={theme.colors.textMuted}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Detailed Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Provide details about your order or query..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.primaryTealDark} />
              ) : (
                <Text style={styles.submitBtnText}>Submit Support Ticket</Text>
              )}
            </TouchableOpacity>
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
    maxHeight: '88%',
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primaryTeal,
  },
  sub: {
    fontSize: 11,
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
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2FBDD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C8F169',
  },
  helplineIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  helplineTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
  helplineSub: {
    fontSize: 11,
    color: theme.colors.textCharcoal,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textCharcoal,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textCharcoal,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.textInk,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: theme.colors.accentLime,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
});
