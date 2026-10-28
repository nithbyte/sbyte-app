import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/tokens';
import { SByteLogo } from './SByteLogo';

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
        <SByteLogo variant="compact" size={32} light={true} />

        {/* 15-Min Delivery Badge */}
        <View style={styles.slaBadge}>
          <Ionicons name="flash" size={13} color="#0D2D27" />
          <View>
            <Text style={styles.slaTitle}>15 MINS</Text>
            <Text style={styles.slaSubtitle}>Superfast</Text>
          </View>
        </View>
      </View>

      {/* Location Selector Pill */}
      <TouchableOpacity onPress={onSelectLocality} style={styles.locationSelector} activeOpacity={0.85}>
        <Ionicons name="location-sharp" size={15} color={theme.colors.accentLime} style={{ marginRight: 6 }} />
        <Text style={styles.locationText} numberOfLines={1}>
          {currentLocality}, Tirunelveli
        </Text>
        <Ionicons name="chevron-down" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#123D35" style={styles.searchIcon} />
        <TextInput
          placeholder="Search rice, halwa, veggies, plastics..."
          placeholderTextColor="#8C948F"
          value={searchQuery}
          onChangeText={onSearchChange}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearSearch}>
            <Ionicons name="close-circle" size={18} color="#8C948F" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0E332C',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 105, 0.2)',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accentLime,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  slaTitle: {
    color: '#0D2D27',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  slaSubtitle: {
    color: '#16433A',
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#16231F',
    fontWeight: '500',
  },
  clearSearch: {
    padding: 4,
  },
});
