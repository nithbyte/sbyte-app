import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/tokens';

export type TabType = 'home' | 'categories' | 'cart' | 'account';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  cartCount: number;
  cartSubtotal: number;
}

interface TabConfig {
  key: TabType;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  cartSubtotal,
}) => {
  const tabs: TabConfig[] = [
    {
      key: 'home',
      label: 'Home',
      activeIcon: 'home',
      inactiveIcon: 'home-outline',
    },
    {
      key: 'categories',
      label: 'Categories',
      activeIcon: 'grid',
      inactiveIcon: 'grid-outline',
    },
    {
      key: 'cart',
      label: 'Cart',
      activeIcon: 'bag-handle',
      inactiveIcon: 'bag-handle-outline',
    },
    {
      key: 'account',
      label: 'Account',
      activeIcon: 'person',
      inactiveIcon: 'person-outline',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isCart = tab.key === 'cart';

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.inactiveIcon}
                  size={22}
                  color={isActive ? theme.colors.accentLime : '#8FA89E'}
                />

                {isCart && cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>

              {isCart && cartCount > 0 && activeTab !== 'cart' && (
                <Text style={styles.miniCartPrice}>₹{cartSubtotal}</Text>
              )}

              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A241F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 241, 105, 0.15)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: 'rgba(200, 241, 105, 0.08)',
  },
  iconContainer: {
    position: 'relative',
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: theme.colors.accentLime,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0A241F',
  },
  cartBadgeText: {
    color: theme.colors.primaryTealDark,
    fontSize: 10,
    fontWeight: '900',
  },
  label: {
    fontSize: 11,
    color: '#8FA89E',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  activeLabel: {
    color: theme.colors.accentLime,
    fontWeight: '800',
  },
  miniCartPrice: {
    fontSize: 9,
    color: theme.colors.accentLime,
    fontWeight: '800',
    marginTop: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.accentLime,
  },
});
