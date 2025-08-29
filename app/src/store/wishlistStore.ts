import { create } from 'zustand';
import { WishlistItem, PreviewResponse } from '../types';
import { databaseService } from '../services/database';
import { apiService } from '../services/api';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  isAdding: boolean;
  addError: string | null;
}

interface WishlistActions {
  // State management
  setItems: (items: WishlistItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAdding: (adding: boolean) => void;
  setAddError: (error: string | null) => void;

  // Data operations
  loadItems: () => Promise<void>;
  addItem: (url: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // Preview operations
  getPreview: (url: string) => Promise<PreviewResponse>;
}

type WishlistStore = WishlistState & WishlistActions;

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  // Initial state
  items: [],
  isLoading: false,
  error: null,
  isAdding: false,
  addError: null,

  // State setters
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setAdding: (adding) => set({ isAdding: adding }),
  setAddError: (error) => set({ addError: error }),

  // Load all items from database
  loadItems: async () => {
    try {
      set({ isLoading: true, error: null });
      const items = await databaseService.getItems();
      set({ items, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load items';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Add new item to wishlist
  addItem: async (url: string) => {
    try {
      set({ isAdding: true, addError: null });

      // Get preview from API
      const preview = await get().getPreview(url);

      // Add to database
      const newItem = await databaseService.addItem({
        title: preview.title,
        image: preview.image || '',
        price: preview.price || '',
        currency: preview.currency || '',
        siteName: preview.siteName || '',
        sourceUrl: preview.sourceUrl,
        normalizedUrl: '', // Will be set by database service
      });

      // Update state
      set((state) => ({
        items: [newItem, ...state.items],
        isAdding: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
      set({ addError: errorMessage, isAdding: false });
      throw error;
    }
  },

  // Delete item from wishlist
  deleteItem: async (id: string) => {
    try {
      await databaseService.deleteItem(id);
      set((state) => ({
        items: state.items.filter(item => item.id !== id),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      set({ error: errorMessage });
    }
  },

  // Clear all items
  clearAll: async () => {
    try {
      await databaseService.clearAll();
      set({ items: [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear items';
      set({ error: errorMessage });
    }
  },

  // Get preview from API
  getPreview: async (url: string): Promise<PreviewResponse> => {
    try {
      return await apiService.getPreviewWithRetry({ url });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get preview';
      throw new Error(errorMessage);
    }
  },
}));
