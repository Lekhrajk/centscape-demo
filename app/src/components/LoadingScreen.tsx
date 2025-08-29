import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { theme } from '../theme';



interface LoadingScreenProps {
  type?: 'full' | 'list' | 'card';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ type = 'full' }) => {
  if (type === 'full') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (type === 'list') {
    return (
      <View style={styles.listContainer}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.listItem}>
            <View style={styles.listImage} />
            <View style={styles.listContent}>
              <View style={styles.listTitle} />
              <View style={styles.listPrice} />
              <View style={styles.listDomain} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'card') {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.previewCard}>
          <View style={styles.previewImage} />
          <View style={styles.previewContent}>
            <View style={styles.previewTitle} />
            <View style={styles.previewPrice} />
            <View style={styles.previewDomain} />
          </View>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  listContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.border,
  },
  listContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listTitle: {
    width: '90%',
    height: 18,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  listPrice: {
    width: '50%',
    height: 16,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.border,
  },
  listDomain: {
    width: '30%',
    height: 14,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border,
  },
  cardContainer: {
    padding: theme.spacing.md,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.border,
  },
  previewContent: {
    padding: theme.spacing.md,
  },
  previewTitle: {
    width: '100%',
    height: 24,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  previewPrice: {
    width: '60%',
    height: 20,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  previewDomain: {
    width: '40%',
    height: 16,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border,
  },
});

export default LoadingScreen;
