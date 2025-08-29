import { Theme } from '../types';

export const theme = {
  colors: {
    primary: '#4CAF50', // Light green
    secondary: '#81C784', // Lighter green
    background: '#F1F8E9', // Very light pastel green background
    surface: '#FFFFFF', // White cards
    text: '#212121', // Dark text
    textSecondary: '#757575', // Gray text
    textLight: '#9E9E9E', // Light gray text
    border: '#E0E0E0', // Light border
    success: '#4CAF50', // Green for progress
    progressBackground: '#E8F5E8', // Light green progress background
    navigation: '#424242', // Dark gray navigation
    card: '#FFFFFF', // White cards
    shadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow
    error: '#F44336', // Red for errors
    warning: '#FF9800', // Orange for warnings
    placeholder: '#BDBDBD', // Light gray for placeholders
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 20,
  },
  typography: {
    h1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#212121',
    },
    h2: {
      fontSize: 20,
      fontWeight: '600',
      color: '#212121',
    },
    h3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#212121',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      color: '#212121',
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#757575',
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal',
      color: '#9E9E9E',
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  },
  shadows: {
    small: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textLight: '#808080',
    border: '#333333',
  },
};
