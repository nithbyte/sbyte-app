import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { theme } from '../theme/tokens';

export type TabType = 'home' | 'categories' | 'cart' | 'account';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  cartCount: number;
  cartSubtotal: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  cartSubtotal,
}) => {
  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'categories', label: 'Categories', icon: '🗂️' },
    { key: 'cart', label: 'Cart', icon: '🛒' },
    { key: 'account', label: 'Account', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{tab.icon}</Text>
              {tab.key === 'cart' && cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
            {tab.key === 'cart' && cartCount > 0 && activeTab !== 'cart' && (
              <Text style={styles.miniCartPrice}>₹{cartSubtotal}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryTeal,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 241, 105, 0.2)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(200, 241, 105, 0.12)',
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: theme.colors.accentLime,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: theme.colors.primaryTealDark,
    fontSize: 10,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    color: '#A0B2AB',
    fontWeight: '600',
  },
  activeLabel: {
    color: theme.colors.accentLime,
    fontWeight: '800',
  },
  miniCartPrice: {
    fontSize: 9,
    color: theme.colors.accentLime,
    fontWeight: '700',
    marginTop: 1,
  },
});
