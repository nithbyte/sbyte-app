/**
 * S BYTE Design System Tokens
 * Brand Identity for Tirunelveli Quick-Commerce Mini-Supermarkets
 */

export const colors = {
  // Primary brand palette
  primary: {
    deepTeal: '#123D35',
    deepTealDark: '#0D2D27',
    deepTealLight: '#1B5449',
    deepTealSurface: '#E8F1EE',
  },
  accent: {
    electricLime: '#C8F169',
    electricLimeHover: '#BCE859',
    electricLimeDark: '#9ABF3B',
    electricLimeSubtle: '#F2FBDD',
  },
  background: {
    warmCream: '#FFF9EF',
    warmCreamPure: '#FFFFFF',
    warmCreamCard: '#FDFCFA',
    canvasMuted: '#F4F2EC',
  },
  neutral: {
    darkInk: '#19231F',
    charcoal: '#2D3833',
    slate: '#596761',
    mutedGray: '#8C948F',
    borderLight: '#E3E6E1',
    borderSubtle: '#F0F2EE',
  },
  semantic: {
    success: '#15803D',
    successBg: '#DCFCE7',
    warning: '#B45309',
    warningBg: '#FEF3C7',
    error: '#B91C1C',
    errorBg: '#FEE2E2',
    info: '#0369A1',
    infoBg: '#E0F2FE',
  },
  storePill: {
    palayamkottai: '#123D35',
    vannarpettai: '#1E40AF',
    tirunelveliTown: '#B45309',
  }
} as const;

export const typography = {
  fonts: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
  }
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
} as const;

export const radii = {
  none: '0',
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(25, 35, 31, 0.05)',
  md: '0 4px 6px -1px rgba(25, 35, 31, 0.08), 0 2px 4px -2px rgba(25, 35, 31, 0.04)',
  lg: '0 10px 15px -3px rgba(25, 35, 31, 0.1), 0 4px 6px -4px rgba(25, 35, 31, 0.05)',
  highlight: '0 0 0 2px #C8F169, 0 8px 20px rgba(18, 61, 53, 0.15)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
