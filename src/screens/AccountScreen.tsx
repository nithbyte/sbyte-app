import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { SByteLogo } from '../components/SByteLogo';
import { api, API_BASE_URL } from '../api/client';
import { OrderSummary } from '@sbyte/shared-types';

interface AccountScreenProps {
  onOpenAuth: () => void;
  onOpenAddressModal: () => void;
  onOpenSupportModal: (orderId?: string) => void;
  onSelectOrder: (order: OrderSummary) => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  onOpenAuth,
  onOpenAddressModal,
  onOpenSupportModal,
  onSelectOrder,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { savedAddresses } = useLocation();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'EN' | 'TA'>('EN');
  const [apiHealth, setApiHealth] = useState<{ isLive: boolean; status: string }>({
    isLive: true,
    status: 'checking...',
  });

  useEffect(() => {
    checkHealth();
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const checkHealth = async () => {
    try {
      const h = await api.checkHealth();
      setApiHealth({ isLive: h.isLive, status: h.isLive ? 'Live NestJS Server' : 'Offline' });
    } catch {
      setApiHealth({ isLive: false, status: 'Dev Fallback (Offline)' });
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const list = await api.getOrders();
      setOrders(list);
    } catch {
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of S BYTE?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <SByteLogo variant="compact" size={32} light={true} />
        <View style={styles.slaBadge}>
          <Ionicons name="shield-checkmark" size={13} color="#0D2D27" />
          <Text style={styles.slaText}>Secure Account</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        {isAuthenticated && user ? (
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user.fullName ? user.fullName[0].toUpperCase() : 'U'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.profileName}>{user.fullName}</Text>
              <Text style={styles.profilePhone}>{user.phone}</Text>
              {user.email && <Text style={styles.profileEmail}>{user.email}</Text>}
              <View style={styles.customerPill}>
                <Ionicons name="checkmark-circle" size={12} color="#123D35" />
                <Text style={styles.customerPillText}>Verified Customer</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.guestTitle}>Welcome to S BYTE</Text>
              <Text style={styles.guestSub}>
                Sign in to view orders, reward points, and superfast checkout.
              </Text>
            </View>
            <TouchableOpacity style={styles.signInBtn} onPress={onOpenAuth} activeOpacity={0.85}>
              <Text style={styles.signInBtnText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={14} color="#0D2D27" />
            </TouchableOpacity>
          </View>
        )}

        {/* Loyalty & Rewards Ledger Card */}
        {isAuthenticated && (
          <View style={styles.loyaltyCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="star" size={18} color="#FFB300" />
                <View>
                  <Text style={styles.loyaltyTitle}>S BYTE Loyalty Club</Text>
                  <Text style={styles.loyaltySub}>1 pt per ₹10 spent • 1 pt = ₹0.10 off</Text>
                </View>
              </View>
              <View style={styles.tierPill}>
                <Text style={styles.tierPillText}>SILVER TIER</Text>
              </View>
            </View>

            <View style={styles.loyaltyBalanceRow}>
              <View>
                <Text style={styles.pointsNumber}>250</Text>
                <Text style={styles.pointsLabel}>Reward Points (Worth ₹25.00)</Text>
              </View>
              <View style={styles.referralBox}>
                <Text style={styles.referralLabel}>Referral Code</Text>
                <Text style={styles.referralCode}>SB944330</Text>
              </View>
            </View>
          </View>
        )}

        {/* Customer Convenience Hub */}
        {isAuthenticated && (
          <View style={styles.convenienceGrid}>
            <TouchableOpacity
              style={styles.convenienceItem}
              onPress={() => Alert.alert('Saved Favorites', 'Browse your frequently purchased staples and favorites.')}
            >
              <View style={[styles.convIconCircle, { backgroundColor: '#FDE8E8' }]}>
                <Ionicons name="heart" size={18} color="#E02424" />
              </View>
              <Text style={styles.convenienceText}>Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.convenienceItem}
              onPress={() => Alert.alert('Shopping Lists', 'Create reusable grocery and household shopping lists.')}
            >
              <View style={[styles.convIconCircle, { backgroundColor: '#E1EFFE' }]}>
                <Ionicons name="list" size={18} color="#1A56DB" />
              </View>
              <Text style={styles.convenienceText}>My Lists</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.convenienceItem}
              onPress={() => Alert.alert('Reminders', 'Configure weekly or monthly grocery replenishment reminders.')}
            >
              <View style={[styles.convIconCircle, { backgroundColor: '#EDF2F7' }]}>
                <Ionicons name="time" size={18} color="#3182CE" />
              </View>
              <Text style={styles.convenienceText}>Reminders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.convenienceItem}
              onPress={() => Alert.alert('Returns & Refunds', 'Track and request returns on eligible delivered items.')}
            >
              <View style={[styles.convIconCircle, { backgroundColor: '#E6FFFA' }]}>
                <Ionicons name="repeat" size={18} color="#234E52" />
              </View>
              <Text style={styles.convenienceText}>Returns</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Orders Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="receipt" size={16} color="#123D35" />
              <Text style={styles.sectionTitle}>Recent Orders</Text>
            </View>
            {isAuthenticated && (
              <TouchableOpacity onPress={loadOrders}>
                <Text style={styles.refreshLink}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingOrders ? (
            <ActivityIndicator color={theme.colors.primaryTeal} style={{ marginVertical: 12 }} />
          ) : orders.length > 0 ? (
            orders.slice(0, 3).map((ord) => (
              <View key={ord.id} style={styles.orderContainer}>
                <TouchableOpacity
                  style={styles.orderRow}
                  onPress={() => onSelectOrder(ord)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderNum}>{ord.orderNumber}</Text>
                    <Text style={styles.orderStore}>{ord.storeName || 'Palayamkottai Store'}</Text>
                    <Text style={styles.orderItemsCount}>
                      {ord.items.length} items • ₹{ord.totalAmount}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{ord.status}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.orderActionRow}>
                  <TouchableOpacity
                    style={styles.invoiceBtn}
                    onPress={async () => {
                      try {
                        const inv = await api.getOrderInvoice(ord.id);
                        Alert.alert(
                          `GST Tax Invoice ${inv?.invoiceNumber || 'INV-PLK'}`,
                          `GSTIN: 33AABCS1234F1Z8\nTotal: ₹${ord.totalAmount}\nCGST: ₹${inv?.cgst || '17.83'}\nSGST: ₹${inv?.sgst || '17.83'}\n\nRule 46 compliant electronic invoice.`,
                        );
                      } catch {
                        Alert.alert('Tax Invoice', `Invoice generated for ${ord.orderNumber}. Available for download.`);
                      }
                    }}
                  >
                    <Ionicons name="document-text-outline" size={12} color="#123D35" style={{ marginRight: 4 }} />
                    <Text style={styles.invoiceBtnText}>Tax Invoice</Text>
                  </TouchableOpacity>

                  {ord.status === 'DELIVERED' && (
                    <TouchableOpacity
                      style={styles.returnBtn}
                      onPress={() => onOpenSupportModal(ord.id)}
                    >
                      <Ionicons name="arrow-undo-outline" size={12} color="#7B8A84" style={{ marginRight: 4 }} />
                      <Text style={styles.returnBtnText}>Return Item</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyOrdersText}>
              {isAuthenticated
                ? 'No past orders found. Place your first order for 15-min delivery!'
                : 'Sign in to view your order history.'}
            </Text>
          )}
        </View>

        {/* Quick Menu Options */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={onOpenAddressModal}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="location" size={18} color="#123D35" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.menuTitle}>Saved Delivery Addresses</Text>
              <Text style={styles.menuSub}>{savedAddresses.length} addresses configured</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8A9993" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => onOpenSupportModal()}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="chatbubbles" size={18} color="#123D35" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.menuTitle}>Help & Support Desk</Text>
              <Text style={styles.menuSub}>Store helpline: 0462-2500000</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8A9993" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Language Toggle */}
          <View style={styles.menuRow}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="globe" size={18} color="#123D35" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.menuTitle}>App Language</Text>
              <Text style={styles.menuSub}>English & தமிழ்</Text>
            </View>
            <View style={styles.langToggle}>
              <TouchableOpacity
                style={[styles.langBtn, selectedLang === 'EN' && styles.activeLangBtn]}
                onPress={() => setSelectedLang('EN')}
              >
                <Text style={[styles.langText, selectedLang === 'EN' && styles.activeLangText]}>
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBtn, selectedLang === 'TA' && styles.activeLangBtn]}
                onPress={() => setSelectedLang('TA')}
              >
                <Text style={[styles.langText, selectedLang === 'TA' && styles.activeLangText]}>
                  தமிழ்
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Platform Connectivity Info */}
        <View style={styles.apiInfoCard}>
          <View style={styles.apiHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="radio" size={16} color="#123D35" />
              <Text style={styles.apiTitle}>API Connectivity</Text>
            </View>
            <View
              style={[
                styles.healthBadge,
                apiHealth.isLive ? styles.healthLive : styles.healthOffline,
              ]}
            >
              <Text
                style={[
                  styles.healthText,
                  apiHealth.isLive ? styles.healthLiveText : styles.healthOfflineText,
                ]}
              >
                {apiHealth.status}
              </Text>
            </View>
          </View>
          <Text style={styles.apiUrlText}>Endpoint: {API_BASE_URL}</Text>
          <TouchableOpacity style={styles.pingBtn} onPress={checkHealth} activeOpacity={0.8}>
            <Ionicons name="refresh" size={13} color="#123D35" style={{ marginRight: 4 }} />
            <Text style={styles.pingBtnText}>Test Server Connection</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={16} color="#E02424" style={{ marginRight: 6 }} />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F7',
  },
  topHeader: {
    backgroundColor: '#0E332C',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  slaText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0D2D27',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7ECE9',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0E332C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.accentLime,
    fontSize: 22,
    fontWeight: '900',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16231F',
  },
  profilePhone: {
    fontSize: 12,
    color: '#6E7D77',
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 11,
    color: '#8A9993',
    marginTop: 1,
  },
  customerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(200, 241, 105, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  customerPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D2D27',
  },
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7ECE9',
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16231F',
  },
  guestSub: {
    fontSize: 12,
    color: '#6E7D77',
    marginTop: 4,
  },
  signInBtn: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signInBtnText: {
    color: '#0D2D27',
    fontWeight: '900',
    fontSize: 12,
  },
  loyaltyCard: {
    backgroundColor: '#0E332C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 105, 0.3)',
  },
  loyaltyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loyaltySub: {
    fontSize: 10,
    color: '#B2C4BD',
    marginTop: 2,
  },
  tierPill: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierPillText: {
    color: '#0D2D27',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  loyaltyBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  pointsNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.accentLime,
  },
  pointsLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  referralBox: {
    alignItems: 'flex-end',
  },
  referralLabel: {
    fontSize: 9,
    color: '#B2C4BD',
    textTransform: 'uppercase',
  },
  referralCode: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.colors.accentLime,
    letterSpacing: 0.8,
  },
  convenienceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  convenienceItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7ECE9',
  },
  convIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  convenienceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2C3A35',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7ECE9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16231F',
  },
  refreshLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#123D35',
  },
  orderContainer: {
    backgroundColor: '#F9FAF9',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EAEFEA',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16231F',
  },
  orderStore: {
    fontSize: 11,
    color: '#6E7D77',
    marginTop: 2,
  },
  orderItemsCount: {
    fontSize: 11,
    color: '#123D35',
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: 'rgba(18, 61, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#123D35',
  },
  orderActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EFF3F0',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8DFDA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  invoiceBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#123D35',
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8DFDA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  returnBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#55655E',
  },
  emptyOrdersText: {
    fontSize: 12,
    color: '#8A9993',
    textAlign: 'center',
    marginVertical: 14,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7ECE9',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EBF2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16231F',
  },
  menuSub: {
    fontSize: 11,
    color: '#7B8A84',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F3F1',
    marginHorizontal: 8,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F3F1',
    borderRadius: 8,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeLangBtn: {
    backgroundColor: '#0E332C',
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#55655E',
  },
  activeLangText: {
    color: theme.colors.accentLime,
  },
  apiInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7ECE9',
  },
  apiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  apiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16231F',
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  healthLive: {
    backgroundColor: '#DEF7EC',
  },
  healthOffline: {
    backgroundColor: '#FDE8E8',
  },
  healthText: {
    fontSize: 10,
    fontWeight: '800',
  },
  healthLiveText: {
    color: '#03543F',
  },
  healthOfflineText: {
    color: '#9B1C1C',
  },
  apiUrlText: {
    fontSize: 10,
    color: '#8A9993',
  },
  pingBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  pingBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#123D35',
  },
  logoutBtn: {
    backgroundColor: '#FDE8E8',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  logoutBtnText: {
    color: '#E02424',
    fontSize: 13,
    fontWeight: '800',
  },
});
