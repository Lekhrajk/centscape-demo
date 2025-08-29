import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

// Mock the navigation and other dependencies
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../services/database', () => ({
  databaseService: {
    initialize: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../store/wishlistStore', () => ({
  useWishlistStore: () => ({
    loadItems: jest.fn(),
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<App />);
    // The app should render without throwing any errors
    expect(getByText).toBeDefined();
  });
});
