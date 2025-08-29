import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { WishlistItem as WishlistItemType } from '../types';
import { theme } from '../theme';
import { useWishlistStore } from '../store/wishlistStore';

interface WishlistItemProps {
  item: WishlistItemType;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ item }) => {
  const { deleteItem } = useWishlistStore();

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            deleteItem(item.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  // Extract domain from sourceUrl
  const getDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      accessibilityLabel={`Wishlist item: ${item.title}`}
      accessibilityHint="Long press to remove this item from your wishlist"
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            contentFit="cover"
            placeholder={require('../../assets/placeholder.jpg')}
            transition={200}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Image
              source={require('../../assets/placeholder.jpg')}
              style={styles.placeholderImage}
              contentFit="cover"
            />
          </View>
        )}
      </View>

              {/* Product Info */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.domain}>
            {getDomain(item.sourceUrl)}
          </Text>
          <Text style={styles.date}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          {item.price ? `${item.price}` : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  domain: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: theme.spacing.sm,
    minWidth: 60,
  },
  price: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

export default WishlistItem;
