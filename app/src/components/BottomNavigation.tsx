import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useNavigation } from '../context/NavigationContext';

const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigation();

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    // Here you can add navigation logic for different tabs
  };

  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity 
        style={[
          styles.navButton, 
          activeTab === 'home' && styles.activeNavButton
        ]}
        onPress={() => handleTabPress('home')}
        accessibilityLabel="Home tab"
      >
        <Ionicons 
          name="home" 
          size={24} 
          color={activeTab === 'home' ? "#FFFFFF" : theme.colors.textLight} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.navButton, 
          activeTab === 'wallet' && styles.activeNavButton
        ]}
        onPress={() => handleTabPress('wallet')}
        accessibilityLabel="Wallet tab"
      >
        <Ionicons 
          name="wallet" 
          size={24} 
          color={activeTab === 'wallet' ? "#FFFFFF" : theme.colors.textLight} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.navButton, 
          activeTab === 'cart' && styles.activeNavButton
        ]}
        onPress={() => handleTabPress('cart')}
        accessibilityLabel="Cart tab"
      >
        <Ionicons 
          name="cart" 
          size={24} 
          color={activeTab === 'cart' ? "#FFFFFF" : theme.colors.textLight} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.navButton, 
          activeTab === 'time' && styles.activeNavButton
        ]}
        onPress={() => handleTabPress('time')}
        accessibilityLabel="History tab"
      >
        <Ionicons 
          name="time" 
          size={24} 
          color={activeTab === 'time' ? "#FFFFFF" : theme.colors.textLight} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.small,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  activeNavButton: {
    backgroundColor: theme.colors.text,
  },
});

export default BottomNavigation;
