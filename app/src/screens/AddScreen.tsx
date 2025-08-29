import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import { useWishlistStore } from '../store/wishlistStore';
import LoadingScreen from '../components/LoadingScreen';

type AddScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Add'>;
type AddScreenRouteProp = RouteProp<RootStackParamList, 'Add'>;

const AddScreen: React.FC = () => {
  const navigation = useNavigation<AddScreenNavigationProp>();
  const route = useRoute<AddScreenRouteProp>();
  const { addItem, isAdding, addError, getPreview } = useWishlistStore();

  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    // Handle deep linking - pre-fill URL if provided
    if (route.params?.url) {
      setUrl(route.params.url);
      handlePreview(route.params.url);
    }
  }, [route.params?.url]);

  const handlePreview = async (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setPreviewError('Please enter a URL');
      return;
    }

    try {
      setIsLoadingPreview(true);
      setPreviewError(null);
      
      const previewData = await getPreview(inputUrl);
      setPreview(previewData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load preview';
      setPreviewError(errorMessage);
      setPreview(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    if (!preview) {
      Alert.alert('Error', 'Please load a preview first');
      return;
    }

    try {
      await addItem(url);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Success',
        'Item added to your wishlist!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
      Alert.alert('Error', errorMessage);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        setUrl(clipboardContent);
        // Auto-preview if it looks like a URL
        if (clipboardContent.startsWith('http')) {
          handlePreview(clipboardContent);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const handleClear = () => {
    setUrl('');
    setPreview(null);
    setPreviewError(null);
  };

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return 'unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add to Wishlist</Text>
            <Text style={styles.subtitle}>
              Paste a URL to preview and add items to your wishlist
            </Text>
          </View>

          {/* URL Input */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={url}
                onChangeText={setUrl}
                placeholder="Paste a URL here..."
                placeholderTextColor={theme.colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={() => handlePreview(url)}
                accessibilityLabel="URL input field"
                accessibilityHint="Enter or paste a URL to preview the item"
              />
              <TouchableOpacity
                style={styles.pasteButton}
                onPress={handlePasteFromClipboard}
                accessibilityRole="button"
                accessibilityLabel="Paste from clipboard"
              >
                <Ionicons name="clipboard-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.previewButton]}
                onPress={() => handlePreview(url)}
                disabled={isLoadingPreview || !url.trim()}
                accessibilityRole="button"
                accessibilityLabel="Load preview"
                accessibilityHint="Fetches preview information for the URL"
              >
                {isLoadingPreview ? (
                  <Text style={styles.buttonText}>Loading...</Text>
                ) : (
                  <>
                    <Ionicons name="eye-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Preview</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={handleClear}
                disabled={!url.trim() && !preview}
                accessibilityRole="button"
                accessibilityLabel="Clear input"
              >
                <Ionicons name="close-outline" size={20} color={theme.colors.text} />
                <Text style={[styles.buttonText, styles.clearButtonText]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Display */}
          {(addError || previewError) && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
              <Text style={styles.errorText}>
                {addError || previewError}
              </Text>
            </View>
          )}

          {/* Preview Section */}
          {isLoadingPreview && (
            <LoadingScreen type="card" />
          )}

          {preview && !isLoadingPreview && (
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Preview</Text>
              
              <View style={styles.previewCard}>
                {preview.image && (
                  <View style={styles.previewImageContainer}>
                    <Image
                      source={{ uri: preview.image }}
                      style={styles.previewImage}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                )}
                
                <View style={styles.previewContent}>
                  <Text style={styles.previewItemTitle} numberOfLines={2}>
                    {preview.title}
                  </Text>
                  
                  <View style={styles.previewDetails}>
                    {preview.price && (
                      <View style={styles.previewPriceContainer}>
                        <Ionicons name="pricetag-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.previewPrice}>
                          {preview.price}{preview.currency ? ` ${preview.currency}` : ''}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.previewDomainContainer}>
                      <Ionicons name="globe-outline" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.previewDomain}>
                        {preview.siteName || getDomain(preview.sourceUrl)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddToWishlist}
                disabled={isAdding}
                accessibilityRole="button"
                accessibilityLabel="Add to wishlist"
                accessibilityHint="Adds the previewed item to your wishlist"
              >
                {isAdding ? (
                  <Text style={styles.buttonText}>Adding...</Text>
                ) : (
                  <>
                    <Ionicons name="heart" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Add to Wishlist</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Instructions */}
          {!preview && !isLoadingPreview && (
            <View style={styles.instructionsContainer}>
              <Ionicons name="information-circle-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.instructionsTitle}>How to add items</Text>
              <Text style={styles.instructionsText}>
                1. Paste a URL from any online store or product page{'\n'}
                2. Tap "Preview" to see the item details{'\n'}
                3. Tap "Add to Wishlist" to save it
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0, // No top padding
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 20, // No top padding
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  inputSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  pasteButton: {
    padding: theme.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  previewButton: {
    backgroundColor: theme.colors.primary,
  },
  clearButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addButton: {
    backgroundColor: theme.colors.success,
    marginTop: theme.spacing.lg,
  },
  buttonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as any,
    color: '#fff',
  },
  clearButtonText: {
    color: theme.colors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  previewSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  previewTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewImageContainer: {
    width: '100%',
    height: 200,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewContent: {
    padding: theme.spacing.lg,
  },
  previewItemTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  previewDetails: {
    gap: theme.spacing.sm,
  },
  previewPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewPrice: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as any,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  previewDomainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDomain: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  instructionsTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  instructionsText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AddScreen;
