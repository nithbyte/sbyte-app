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
import { theme } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
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
      setApiHealth({ isLive: h.isLive, status: h.isLive ? 'Connected (Live NestJS)' : 'Dev Fallback (Offline)' });
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
      // Default sample order if server empty
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
        <Text style={styles.title}>Account & Settings</Text>
        <Text style={styles.subTitle}>S BYTE Quick Commerce • Tirunelveli</Text>
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
                <Text style={styles.customerPillText}>Verified Customer</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.guestTitle}>Welcome to S BYTE</Text>
              <Text style={styles.guestSub}>
                Sign in to view orders, saved addresses, and faster checkout.
              </Text>
            </View>
            <TouchableOpacity style={styles.signInBtn} onPress={onOpenAuth}>
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Orders Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📦 Recent Orders</Text>
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
              <TouchableOpacity
                key={ord.id}
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
            <Text style={styles.menuIcon}>📍</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.menuTitle}>Saved Delivery Addresses</Text>
              <Text style={styles.menuSub}>{savedAddresses.length} addresses configured</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => onOpenSupportModal()}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>💬</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.menuTitle}>Help & Support Desk</Text>
              <Text style={styles.menuSub}>Store helpline: 0462-2500000</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Language Toggle */}
          <View style={styles.menuRow}>
            <Text style={styles.menuIcon}>🌐</Text>
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
            <Text style={styles.apiTitle}>📡 API Connectivity</Text>
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
          <TouchableOpacity style={styles.pingBtn} onPress={checkHealth}>
            <Text style={styles.pingBtnText}>Test Server Connection</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
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
    paddingBottom: 110,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accentLime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.primaryTealDark,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  profilePhone: {
    fontSize: 12,
    color: theme.colors.textSlate,
    marginTop: 1,
  },
  profileEmail: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  customerPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2FBDD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  customerPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  guestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  guestSub: {
    fontSize: 11,
    color: theme.colors.textSlate,
    marginTop: 2,
  },
  signInBtn: {
    backgroundColor: theme.colors.accentLime,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  signInBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primaryTealDark,
  },
  sectionCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
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
    color: theme.colors.textInk,
  },
  refreshLink: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryTeal,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  orderNum: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textInk,
  },
  orderStore: {
    fontSize: 11,
    color: theme.colors.textSlate,
  },
  orderItemsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primaryTeal,
    marginTop: 1,
  },
  statusPill: {
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textCharcoal,
  },
  emptyOrdersText: {
    fontSize: 12,
    color: theme.colors.textSlate,
    paddingVertical: 8,
  },
  menuCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textInk,
  },
  menuSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  menuArrow: {
    fontSize: 18,
    color: theme.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 8,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeLangBtn: {
    backgroundColor: theme.colors.primaryTeal,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSlate,
  },
  activeLangText: {
    color: theme.colors.accentLime,
  },
  apiInfoCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
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
    color: theme.colors.textInk,
  },
  healthBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  healthLive: {
    backgroundColor: '#DCFCE7',
  },
  healthOffline: {
    backgroundColor: '#FEF3C7',
  },
  healthText: {
    fontSize: 9,
    fontWeight: '800',
  },
  healthLiveText: {
    color: '#15803D',
  },
  healthOfflineText: {
    color: '#B45309',
  },
  apiUrlText: {
    fontSize: 11,
    color: theme.colors.textSlate,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  pingBtn: {
    backgroundColor: theme.colors.bgMuted,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  pingBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryTeal,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
});
