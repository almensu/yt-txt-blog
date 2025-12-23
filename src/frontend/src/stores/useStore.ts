/**
 * Zustand Store
 * Global state management for the application
 */

import { create } from 'zustand';

// Types
interface TxtAsset {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface StyleConfig {
  id: string;
  name: string;
  description: string;
}

interface GeneratedArticle {
  id: string;
  asset_id: string;
  asset_title: string;
  style_id: string;
  style_name: string;
  content: string;
  created_at: string;
}

interface StoreState {
  // Data
  assets: TxtAsset[];
  styles: StyleConfig[];
  articles: GeneratedArticle[];

  // UI State
  isLoading: boolean;
  error: string | null;
  selectedAssetId: string | null;
  selectedStyleId: string | null;

  // Actions
  setAssets: (assets: TxtAsset[]) => void;
  setStyles: (styles: StyleConfig[]) => void;
  setArticles: (articles: GeneratedArticle[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedAsset: (id: string | null) => void;
  setSelectedStyle: (id: string | null) => void;

  // CRUD operations
  addAsset: (asset: TxtAsset) => void;
  updateAsset: (id: string, asset: Partial<TxtAsset>) => void;
  removeAsset: (id: string) => void;
  addArticle: (article: GeneratedArticle) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Initial state
  assets: [],
  styles: [],
  articles: [],
  isLoading: false,
  error: null,
  selectedAssetId: null,
  selectedStyleId: null,

  // Setters
  setAssets: (assets) => set({ assets }),
  setStyles: (styles) => set({ styles }),
  setArticles: (articles) => set({ articles }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSelectedAsset: (selectedAssetId) => set({ selectedAssetId }),
  setSelectedStyle: (selectedStyleId) => set({ selectedStyleId }),

  // Asset operations
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  updateAsset: (id, updatedAsset) =>
    set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, ...updatedAsset } : a)),
    })),
  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
      selectedAssetId: state.selectedAssetId === id ? null : state.selectedAssetId,
    })),

  // Article operations
  addArticle: (article) =>
    set((state) => ({
      articles: [article, ...state.articles],
    })),
}));
