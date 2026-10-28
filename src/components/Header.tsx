import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/tokens';

interface HeaderProps {
  currentLocality: string;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSelectLocality: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocality,
  searchQuery,
  onSearchChange,
  onSelectLocality,
}) => {
  return (
    <View style={styles.container}>
      {/* Top row: Brand & SLA Delivery Badge */}
      <View style={styles.topRow}>
        <View>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.brandName}>S BYTE</Text>
            <View style={styles.brandDot} />
          </View>
          <TouchableOpacity onPress={onSelectLocality} style={styles.locationSelector}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {currentLocality}, Tirunelveli
            </Text>
            <Text style={styles.downArrow}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* 15-Min Delivery Badge */}
        <View style={styles.slaBadge}>
          <Text style={styles.slaZap}>⚡</Text>
          <View>
            <Text style={styles.slaTitle}>15 MINS</Text>
            <Text style={styles.slaSubtitle}>Superfast</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search rice, halwa, veggies, plastics..."
          placeholderTextColor="#8C948F"
          value={searchQuery}
          onChangeText={onSearchChange}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primaryTeal,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 24,
    height: 24,
    backgroundColor: theme.colors.accentLime,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: '900',
    fontSize: 14,
    color: theme.colors.primaryTeal,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accentLime,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationPin: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.accentLime,
    maxWidth: 190,
  },
  downArrow: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontSize: 10,
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 241, 105, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 105, 0.3)',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
  },
  slaZap: {
    fontSize: 16,
  },
  slaTitle: {
    color: theme.colors.accentLime,
    fontWeight: '900',
    fontSize: 12,
  },
  slaSubtitle: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textInk,
    padding: 0,
  },
  clearSearch: {
    color: '#8C948F',
    paddingHorizontal: 6,
    fontSize: 14,
    fontWeight: '700',
  },
});
