/**
 * Zustand Store
 * Global state management for the application
 */

import { create } from 'zustand';
import type { Toast } from '../components/Toast';

// Types
interface TxtAsset {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  // P02: Optional metadata fields
  source_video_id?: string;
  source_video_title?: string;
  source_language?: string;
  source_type?: 'youtube' | 'manual';
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
  model?: string;
}

// P02: YouTube Integration Types
interface VideoProcess {
  videoId: string;
  title: string;
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'failed';
  downloadedLanguages: string[];
  processedLanguages: string[];
  importedAssetIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface StoreState {
  // Data (P01)
  assets: TxtAsset[];
  styles: StyleConfig[];
  articles: GeneratedArticle[];

  // P02: YouTube Integration Data
  videos: VideoProcess[];

  // UI State (P01)
  isLoading: boolean;
  error: string | null;
  selectedAssetId: string | null;
  selectedStyleId: string | null;

  // P02: YouTube UI State
  currentStep: number;
  selectedVideo: VideoProcess | null;
  selectedLanguage: string | null;

  // P02: Toast notifications
  toasts: Toast[];

  // Actions (P01)
  setAssets: (assets: TxtAsset[]) => void;
  setStyles: (styles: StyleConfig[]) => void;
  setArticles: (articles: GeneratedArticle[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedAsset: (id: string | null) => void;
  setSelectedStyle: (id: string | null) => void;

  // P02: YouTube Actions
  setVideos: (videos: VideoProcess[]) => void;
  setCurrentStep: (step: number) => void;
  setSelectedVideo: (video: VideoProcess | null) => void;
  setSelectedLanguage: (lang: string | null) => void;
  addVideo: (video: VideoProcess) => void;
  updateVideo: (videoId: string, updates: Partial<VideoProcess>) => void;

  // P02: Toast actions
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // CRUD operations (P01)
  addAsset: (asset: TxtAsset) => void;
  updateAsset: (id: string, asset: Partial<TxtAsset>) => void;
  removeAsset: (id: string) => void;
  addArticle: (article: GeneratedArticle) => void;
  removeArticle: (id: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Initial state (P01)
  assets: [],
  styles: [],
  articles: [],

  // P02: Initial YouTube state
  videos: [],
  currentStep: 1,
  selectedVideo: null,
  selectedLanguage: 'en',

  // P02: Toast state
  toasts: [],

  // UI state
  isLoading: false,
  error: null,
  selectedAssetId: null,
  selectedStyleId: null,

  // Setters (P01)
  setAssets: (assets) => set({ assets }),
  setStyles: (styles) => set({ styles }),
  setArticles: (articles) => set({ articles }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSelectedAsset: (selectedAssetId) => set({ selectedAssetId }),
  setSelectedStyle: (selectedStyleId) => set({ selectedStyleId }),

  // P02: YouTube state setters
  setVideos: (videos) => set({ videos }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setSelectedVideo: (selectedVideo) => set({ selectedVideo }),
  setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),

  // P02: YouTube video operations
  addVideo: (video) =>
    set((state) => ({
      videos: [...state.videos, video],
    })),
  updateVideo: (videoId, updates) =>
    set((state) => ({
      videos: state.videos.map((v) =>
        v.videoId === videoId ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
      ),
    })),

  // Asset operations (P01)
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

  // Article operations (P01)
  addArticle: (article) =>
    set((state) => ({
      articles: [article, ...state.articles],
    })),
  removeArticle: (id) =>
    set((state) => ({
      articles: state.articles.filter((a) => a.id !== id),
    })),

  // P02: Toast operations
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, toast],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));
