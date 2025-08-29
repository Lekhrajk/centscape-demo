import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import { useWishlistStore } from '../store/wishlistStore';
import WishlistItem from '../components/WishlistItem';
import LoadingScreen from '../components/LoadingScreen';

type WishlistScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Wishlist'>;

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<WishlistScreenNavigationProp>();
  const { items, isLoading, error, deleteItem, clearAll } = useWishlistStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.siteName && item.siteName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.sourceUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemDelete = useCallback(async (id: string) => {
    try {
      await deleteItem(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item. Please try again.');
    }
  }, [deleteItem]);

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Items',
      'Are you sure you want to remove all items from your wishlist? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAll();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear items. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAddNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Add');
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => (
    <WishlistItem
      item={item}
    />
  ), []);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No items found' : 'Your wishlist is empty'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms'
          : 'Start by adding your first item to keep track of things you want'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyActionButton}
          onPress={handleAddNew}
          accessibilityRole="button"
          accessibilityLabel="Add your first item"
        >
          <Text style={styles.emptyActionText}>Add Your First Item</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return <LoadingScreen type="list" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Wishlist</Text>
          <Text style={styles.subtitle}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleSearch}
            accessibilityRole="button"
            accessibilityLabel={showSearch ? 'Hide search' : 'Show search'}
          >
            <Ionicons 
              name={showSearch ? 'close' : 'search'} 
              size={24} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
          
          {items.length > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleClearAll}
              accessibilityRole="button"
              accessibilityLabel="Clear all items"
            >
              <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search items..."
              placeholderTextColor={theme.colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search wishlist items"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Items List */}
      <View style={styles.listContainer}>
        <FlashList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={120}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      {/* Floating Action Button */}
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddNew}
          accessibilityRole="button"
          accessibilityLabel="Add new item"
          accessibilityHint="Opens the add item screen"
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  headerButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  separator: {
    height: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  emptyActionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  emptyActionText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as any,
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default WishlistScreen;
