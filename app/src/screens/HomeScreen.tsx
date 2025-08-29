import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import { useWishlistStore } from '../store/wishlistStore';
import WishlistItem from '../components/WishlistItem';
import ProgressCard from '../components/ProgressCard';
import LoadingScreen from '../components/LoadingScreen';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { items, isLoading, error } = useWishlistStore();

  // Memoized calculations to prevent unnecessary recalculations
  const progressData = useMemo(() => {
    const totalValue = items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      return sum + price;
    }, 0);
    
    const goalAmount = 499.99;
    const remainingAmount = Math.max(0, goalAmount - totalValue);
    const progressPercentage = Math.min((totalValue / goalAmount) * 100, 100);
    const daysToGoal = Math.ceil(remainingAmount / 10); // Estimate based on $10/day savings
    
    return {
      totalValue,
      goalAmount,
      remainingAmount,
      progressPercentage,
      daysToGoal,
    };
  }, [items]);

  const recentItems = useMemo(() => items.slice(0, 3), [items]);

  if (isLoading) {
    return <LoadingScreen type="full" />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MY DASHBOARD</Text>
        </View>

        {/* Progress Card */}
        <ProgressCard progressData={progressData} />

        {/* Wishlist Section */}
        <View style={styles.wishlistSection}>
          <View style={styles.wishlistSectionHeader}>
            <Text style={styles.sectionTitle}>MY WISHLIST</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          
          {recentItems.length > 0 ? (
            recentItems.map((item) => (
              <WishlistItem key={item.id} item={item} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items in your wishlist yet</Text>
            </View>
          )}
          
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationalContainer}>
          <Text style={styles.motivationalText}>
            Keep going! According to your spending habits you will reach your goal of ${progressData.goalAmount} in{' '}
            <Text style={styles.daysHighlight}>{progressData.daysToGoal} DAYS</Text>!
          </Text>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('Add')}
        accessibilityLabel="Add items to your Centscape Wishlist"
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h2,
    backgroundColor: theme.colors.text,
    color: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    textAlign: 'center',
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },

  wishlistSection: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  wishlistSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...theme.typography.h2,
    backgroundColor: theme.colors.text,
    color: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    textAlign: 'center',
    alignSelf: 'flex-start',
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  viewAll: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textLight,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: theme.spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
    zIndex: 1000,
  },
  motivationalContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  motivationalText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  daysHighlight: {
    fontWeight: 'bold',
    fontSize: 18,
  },

});

export default HomeScreen;
