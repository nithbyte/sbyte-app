import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme/tokens';
import { useLocation, DeliveryAddress } from '../context/LocationContext';

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({ visible, onClose }) => {
  const {
    currentAddress,
    savedAddresses,
    serviceability,
    isResolving,
    selectAddress,
    addNewAddress,
    deliveryInstructions,
    setDeliveryInstructions,
  } = useLocation();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [tag, setTag] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [recipientName, setRecipientName] = useState('Karthik Raja');
  const [phone, setPhone] = useState('+919876543210');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [locality, setLocality] = useState('Palayamkottai');
  const [instructions, setInstructions] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: 8.718,
    lng: 77.749,
  });

  // Quick preset locations in & around Tirunelveli
  const presets = [
    { name: 'Palayamkottai (Flagship Coverage)', lat: 8.718, lng: 77.749, inRange: true },
    { name: 'Vannarpettai (Bypass Coverage)', lat: 8.728, lng: 77.728, inRange: true },
    { name: 'Tirunelveli Town (Temple Coverage)', lat: 8.733, lng: 77.698, inRange: true },
    { name: 'Alangulam (18 km Out of Area)', lat: 8.87, lng: 77.49, inRange: false },
    { name: 'Tenkasi (45 km Out of Area)', lat: 8.96, lng: 77.31, inRange: false },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setStreetAddress(`${p.name}, Tirunelveli`);
    setLocality(p.name.split(' ')[0]);
    setSelectedCoords({ lat: p.lat, lng: p.lng });
  };

  const handleSaveNewAddress = async () => {
    if (!streetAddress || !recipientName || !phone) {
      Alert.alert('Required Fields', 'Please fill in street address, recipient name, and phone number.');
      return;
    }

    try {
      await addNewAddress({
        tag,
        recipientName,
        phone,
        streetAddress,
        landmark: landmark || undefined,
        locality,
        city: 'Tirunelveli',
        postalCode: '627002',
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        deliveryInstructions: instructions,
        isDefault: false,
      });
      setIsAddingNew(false);
      onClose();
    } catch {
      Alert.alert('Error', 'Could not save address');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.dragPill} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.sheetTitle}>Delivery Location</Text>
              <Text style={styles.subText}>Express 15-min delivery in Tirunelveli</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Serviceability Banner */}
          <View
            style={[
              styles.serviceabilityCard,
              serviceability.serviceable ? styles.serviceableBg : styles.unserviceableBg,
            ]}
          >
            <Text style={styles.serviceIcon}>
              {serviceability.serviceable ? '⚡' : '🚫'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.serviceTitle,
                  serviceability.serviceable ? styles.serviceableText : styles.unserviceableText,
                ]}
              >
                {serviceability.serviceable
                  ? serviceability.message || 'Serviceable Area'
                  : 'Outside Quick-Delivery Coverage'}
              </Text>
              <Text style={styles.serviceDesc}>
                {serviceability.serviceable
                  ? `Assigned Store: ${serviceability.storeName || 'Palayamkottai'} (${serviceability.distanceKm || 1.1} km away)`
                  : 'S BYTE currently operates from 3 physical stores in Palayamkottai, Vannarpettai, and Town.'}
              </Text>
            </View>
            {isResolving && <ActivityIndicator size="small" color={theme.colors.primaryTeal} />}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {!isAddingNew ? (
              <>
                <Text style={styles.sectionHeader}>Saved Addresses</Text>
                {savedAddresses.map((addr) => {
                  const isSelected = currentAddress.id === addr.id;
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      style={[styles.addrCard, isSelected && styles.selectedAddrCard]}
                      onPress={async () => {
                        await selectAddress(addr);
                        onClose();
                      }}
                    >
                      <View style={styles.addrHeader}>
                        <View style={styles.tagBadge}>
                          <Text style={styles.tagText}>{addr.tag}</Text>
                        </View>
                        {isSelected && (
                          <View style={styles.activeCheck}>
                            <Text style={styles.checkText}>✓ Delivering Here</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addrName}>{addr.recipientName}</Text>
                      <Text style={styles.addrText}>{addr.streetAddress}</Text>
                      {addr.landmark && (
                        <Text style={styles.landmarkText}>Landmark: {addr.landmark}</Text>
                      )}
                      {addr.deliveryInstructions && (
                        <Text style={styles.instructionsText}>
                          Note: "{addr.deliveryInstructions}"
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={styles.addNewButton}
                  onPress={() => setIsAddingNew(true)}
                >
                  <Text style={styles.addNewText}>+ Add New Delivery Address</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.formContainer}>
                <Text style={styles.sectionHeader}>Add New Address</Text>

                {/* Tag Selection */}
                <View style={styles.tagSelector}>
                  {(['HOME', 'WORK', 'OTHER'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.tagButton, tag === t && styles.activeTagButton]}
                      onPress={() => setTag(t)}
                    >
                      <Text
                        style={[styles.tagButtonText, tag === t && styles.activeTagButtonText]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Preset Location Shortcuts */}
                <Text style={styles.label}>Test Preset Coordinates</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                  {presets.map((p) => (
                    <TouchableOpacity
                      key={p.name}
                      style={[
                        styles.presetPill,
                        p.inRange ? styles.presetInRange : styles.presetOutOfRange,
                      ]}
                      onPress={() => handleSelectPreset(p)}
                    >
                      <Text style={styles.presetText}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>House / Flat / Street Address *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 142 Rahmath Nagar 3rd Cross"
                    placeholderTextColor={theme.colors.textMuted}
                    value={streetAddress}
                    onChangeText={setStreetAddress}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Landmark (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Near Water Tank"
                    placeholderTextColor={theme.colors.textMuted}
                    value={landmark}
                    onChangeText={setLandmark}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Delivery Instructions for Rider</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Leave at door, do not ring bell"
                    placeholderTextColor={theme.colors.textMuted}
                    value={instructions}
                    onChangeText={setInstructions}
                  />
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSaveNewAddress}
                  >
                    <Text style={styles.saveBtnText}>Save & Deliver Here</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setIsAddingNew(false)}
                  >
                    <Text style={styles.cancelBtnText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
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
    backgroundColor: theme.colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  dragPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDE2DC',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primaryTeal,
  },
  subText: {
    fontSize: 12,
    color: theme.colors.textSlate,
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
  serviceabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  serviceableBg: {
    backgroundColor: '#F2FBDD',
    borderColor: '#C8F169',
  },
  unserviceableBg: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  serviceIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  serviceableText: {
    color: theme.colors.primaryTealDark,
  },
  unserviceableText: {
    color: '#991B1B',
  },
  serviceDesc: {
    fontSize: 11,
    color: theme.colors.textCharcoal,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textInk,
    marginBottom: 10,
  },
  addrCard: {
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedAddrCard: {
    borderColor: theme.colors.primaryTeal,
    backgroundColor: '#F4F9F7',
  },
  addrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagBadge: {
    backgroundColor: 'rgba(18, 61, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primaryTeal,
  },
  activeCheck: {
    backgroundColor: theme.colors.primaryTeal,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  checkText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.accentLime,
  },
  addrName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textInk,
    marginBottom: 2,
  },
  addrText: {
    fontSize: 12,
    color: theme.colors.textCharcoal,
    lineHeight: 18,
  },
  landmarkText: {
    fontSize: 11,
    color: theme.colors.textSlate,
    marginTop: 2,
  },
  instructionsText: {
    fontSize: 11,
    color: theme.colors.primaryTeal,
    fontStyle: 'italic',
    marginTop: 4,
  },
  addNewButton: {
    backgroundColor: theme.colors.primarySurface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(18, 61, 53, 0.2)',
    marginTop: 6,
    marginBottom: 20,
  },
  addNewText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryTeal,
  },
  formContainer: {
    paddingBottom: 20,
  },
  tagSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tagButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTagButton: {
    backgroundColor: theme.colors.primaryTeal,
  },
  tagButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSlate,
  },
  activeTagButtonText: {
    color: theme.colors.accentLime,
  },
  presetScroll: {
    marginBottom: 14,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  presetInRange: {
    backgroundColor: '#F2FBDD',
    borderColor: '#C8F169',
  },
  presetOutOfRange: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700',
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.textInk,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: theme.colors.accentLime,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: theme.colors.bgMuted,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSlate,
  },
});
