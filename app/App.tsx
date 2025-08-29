import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { databaseService } from './src/services/database';
import { useWishlistStore } from './src/store/wishlistStore';
import { theme } from './src/theme';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AddScreen from './src/screens/AddScreen';
import WishlistScreen from './src/screens/WishlistScreen';

// Components
import LoadingScreen from './src/components/LoadingScreen';
import BottomNavigation from './src/components/BottomNavigation';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';

const Stack = createStackNavigator();

function AppContent() {
  const { loadItems } = useWishlistStore();
  const { activeTab, setActiveTab } = useNavigation();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await databaseService.initialize();
      
      // Load existing items
      await loadItems();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };



  const linking = {
    prefixes: ['centscape://', 'https://centscape.com'],
    config: {
      screens: {
        Home: '',
        Add: 'add',
        Wishlist: 'wishlist',
      },
    },
    async getInitialURL() {
      // First, you might want to do the default deep link handling
      const url = await Linking.getInitialURL();
      if (url != null) {
        return url;
      }

      // If no URL was found, you might want to check for custom schemes
      return null;
    },
    subscribe(listener: (url: string) => void) {
      const onReceiveURL = ({ url }: { url: string }) => listener(url);

      // Listen to incoming links from deep linking
      const eventListenerSubscription = Linking.addEventListener('url', onReceiveURL);

      return () => {
        // Clean up the event listeners
        eventListenerSubscription?.remove();
      };
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          <StatusBar style="auto" />
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{ flex: 1 }}>
              <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                  headerStyle: {
                    backgroundColor: theme.colors.primary,
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: '600',
                  },
                  cardStyle: {
                    backgroundColor: theme.colors.background,
                  },
                }}
              >
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    title: 'Centscape Wishlist',
                  }}
                />
                <Stack.Screen
                  name="Add"
                  component={AddScreen}
                  options={{
                    title: 'Add Item',
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="Wishlist"
                  component={WishlistScreen}
                  options={{
                    title: 'My Wishlist',
                  }}
                />
              </Stack.Navigator>
            </View>
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.surface }}>
              <BottomNavigation />
            </SafeAreaView>
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}
