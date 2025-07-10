import { Theme, EqualizerPreset } from "../types";

export const SUPPORTED_AUDIO_FORMATS = [
  "mp3",
  "flac",
  "aac",
  "ogg",
  "wav",
  "m4a",
  "wma",
  "aiff",
  "alac",
];

export const AUDIO_QUALITY_BITRATES = {
  low: 128,
  medium: 256,
  high: 320,
  lossless: 1411,
};

export const EQUALIZER_FREQUENCIES = [
  32, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
];

export const DEFAULT_EQUALIZER_PRESETS: EqualizerPreset[] = [
  {
    id: "flat",
    name: "Flat",
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    isCustom: false,
  },
  {
    id: "rock",
    name: "Rock",
    gains: [4, 3, -1, -2, -1, 1, 3, 4, 4, 4],
    isCustom: false,
  },
  {
    id: "pop",
    name: "Pop",
    gains: [-1, 2, 4, 4, 1, -1, -2, -2, -1, -1],
    isCustom: false,
  },
  {
    id: "jazz",
    name: "Jazz",
    gains: [2, 1, 1, 2, -1, -1, 0, 1, 2, 3],
    isCustom: false,
  },
  {
    id: "classical",
    name: "Classical",
    gains: [3, 2, -1, -1, -1, -1, -1, -2, 2, 3],
    isCustom: false,
  },
  {
    id: "electronic",
    name: "Electronic",
    gains: [3, 2, 0, -1, -2, 1, 0, 1, 3, 4],
    isCustom: false,
  },
  {
    id: "hip-hop",
    name: "Hip-Hop",
    gains: [4, 3, 1, 2, -1, -1, 1, -1, 2, 3],
    isCustom: false,
  },
  {
    id: "acoustic",
    name: "Acoustic",
    gains: [2, 2, 1, 0, 1, 1, 2, 2, 2, 1],
    isCustom: false,
  },
  {
    id: "bass-boost",
    name: "Bass Boost",
    gains: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
    isCustom: false,
  },
  {
    id: "treble-boost",
    name: "Treble Boost",
    gains: [0, 0, 0, 0, 0, 0, 2, 4, 5, 6],
    isCustom: false,
  },
];

export const LIGHT_THEME: Theme = {
  id: "light",
  name: "Light",
  colors: {
    primary: "#0ea5e9",
    secondary: "#64748b",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
    textSecondary: "#64748b",
    accent: "#f59e0b",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    border: "#e2e8f0",
    shadow: "#00000010",
  },
  isDark: false,
};

export const DARK_THEME: Theme = {
  id: "dark",
  name: "Dark",
  colors: {
    primary: "#38bdf8",
    secondary: "#94a3b8",
    background: "#0f172a",
    surface: "#1e293b",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    accent: "#fbbf24",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
    border: "#334155",
    shadow: "#00000040",
  },
  isDark: true,
};

export const MIDNIGHT_THEME: Theme = {
  id: "midnight",
  name: "Midnight",
  colors: {
    primary: "#8b5cf6",
    secondary: "#a78bfa",
    background: "#000000",
    surface: "#111827",
    text: "#f9fafb",
    textSecondary: "#d1d5db",
    accent: "#ec4899",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    border: "#374151",
    shadow: "#00000060",
  },
  isDark: true,
};

export const OCEAN_THEME: Theme = {
  id: "ocean",
  name: "Ocean",
  colors: {
    primary: "#0891b2",
    secondary: "#0e7490",
    background: "#0c4a6e",
    surface: "#075985",
    text: "#f0f9ff",
    textSecondary: "#bae6fd",
    accent: "#06b6d4",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    border: "#0369a1",
    shadow: "#00000050",
  },
  isDark: true,
};

export const AVAILABLE_THEMES = [
  LIGHT_THEME,
  DARK_THEME,
  MIDNIGHT_THEME,
  OCEAN_THEME,
];

export const CROSSFADE_DURATIONS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15];

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export const SLEEP_TIMER_OPTIONS = [
  { label: "Off", value: null },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "End of track", value: -1 },
  { label: "End of album", value: -2 },
  { label: "End of playlist", value: -3 },
];

export const CACHE_SIZES = [
  { label: "100 MB", value: 100 },
  { label: "250 MB", value: 250 },
  { label: "500 MB", value: 500 },
  { label: "1 GB", value: 1000 },
  { label: "2 GB", value: 2000 },
  { label: "5 GB", value: 5000 },
  { label: "Unlimited", value: -1 },
];

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
  { code: "ru", name: "Русский" },
];

export const VISUALIZER_TYPES = [
  "bars",
  "wave",
  "circular",
  "spectrum",
  "particle",
  "off",
];

export const LIBRARY_SORT_OPTIONS = [
  { label: "Title", value: "title" },
  { label: "Artist", value: "artist" },
  { label: "Album", value: "album" },
  { label: "Date Added", value: "dateAdded" },
  { label: "Last Played", value: "lastPlayed" },
  { label: "Play Count", value: "playCount" },
  { label: "Rating", value: "rating" },
  { label: "Duration", value: "duration" },
  { label: "Year", value: "year" },
  { label: "Genre", value: "genre" },
];

export const SMART_PLAYLIST_TEMPLATES = [
  {
    name: "Recently Added",
    criteria: {
      sortBy: "dateAdded" as const,
      sortOrder: "desc" as const,
      limit: 50,
    },
  },
  {
    name: "Most Played",
    criteria: {
      sortBy: "playCount" as const,
      sortOrder: "desc" as const,
      limit: 50,
    },
  },
  {
    name: "Highly Rated",
    criteria: {
      rating: { min: 4 },
      sortBy: "rating" as const,
      sortOrder: "desc" as const,
      limit: 50,
    },
  },
  {
    name: "Never Played",
    criteria: {
      playCount: { max: 0 },
      sortBy: "dateAdded" as const,
      sortOrder: "desc" as const,
      limit: 100,
    },
  },
  {
    name: "Favorites",
    criteria: {
      isLiked: true,
      sortBy: "lastPlayed" as const,
      sortOrder: "desc" as const,
    },
  },
];

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  extraSlow: 800,
};

export const GESTURE_THRESHOLDS = {
  swipe: 50,
  longPress: 500,
  doubleTap: 300,
};
