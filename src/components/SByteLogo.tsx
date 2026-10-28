import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/tokens';

interface SByteLogoProps {
  variant?: 'compact' | 'full' | 'icon' | 'badge';
  size?: number;
  style?: ViewStyle;
  light?: boolean;
}

export const SByteLogo: React.FC<SByteLogoProps> = ({
  variant = 'compact',
  size = 36,
  style,
  light = true,
}) => {
  if (variant === 'icon') {
    return (
      <View style={[styles.iconWrap, { width: size, height: size, borderRadius: size * 0.28 }, style]}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: size, height: size, borderRadius: size * 0.28 }}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (variant === 'badge') {
    return (
      <View style={[styles.badgeContainer, style]}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.badgeImage}
          resizeMode="cover"
        />
        <View style={styles.badgeTextCol}>
          <Text style={[styles.badgeTitle, { color: light ? '#FFFFFF' : theme.colors.textInk }]}>
            S BYTE
          </Text>
          <View style={styles.expressRow}>
            <View style={styles.expressDot} />
            <Text style={styles.expressTag}>15-MIN EXPRESS</Text>
          </View>
        </View>
      </View>
    );
  }

  // Default: 'compact'
  return (
    <View style={[styles.compactContainer, style]}>
      <View style={[styles.logoMark, { width: size, height: size, borderRadius: size * 0.28 }]}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: size, height: size, borderRadius: size * 0.28 }}
          resizeMode="cover"
        />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.brandTitle, { color: light ? '#FFFFFF' : theme.colors.textInk }]}>
            S <Text style={{ color: theme.colors.accentLime }}>BYTE</Text>
          </Text>
        </View>
        <Text style={[styles.brandSubtitle, { color: light ? 'rgba(255,255,255,0.7)' : theme.colors.textMuted }]}>
          Instant Supermarket
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    overflow: 'hidden',
    backgroundColor: theme.colors.primaryTealDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoMark: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(200, 241, 105, 0.4)',
    backgroundColor: theme.colors.primaryTealDark,
  },
  textContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeImage: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  badgeTextCol: {
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  expressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expressDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.accentLime,
  },
  expressTag: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.accentLime,
    letterSpacing: 0.6,
  },
});
