export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  artwork?: string;
  genre?: string;
  year?: number;
  albumArtist?: string;
  trackNumber?: number;
  discNumber?: number;
  rating?: number;
  playCount?: number;
  lastPlayed?: Date;
  dateAdded: Date;
  fileSize?: number;
  bitrate?: number;
  sampleRate?: number;
  lyrics?: string;
  isLiked?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  year?: number;
  genre?: string;
  tracks: Track[];
  totalDuration: number;
  trackCount: number;
  dateAdded: Date;
}

export interface Artist {
  id: string;
  name: string;
  albums: Album[];
  tracks: Track[];
  artwork?: string;
  genre?: string;
  totalDuration: number;
  trackCount: number;
  albumCount: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  artwork?: string;
  isSmartPlaylist: boolean;
  smartCriteria?: SmartPlaylistCriteria;
  dateCreated: Date;
  dateModified: Date;
  totalDuration: number;
  trackCount: number;
}

export interface SmartPlaylistCriteria {
  genre?: string[];
  artist?: string[];
  album?: string[];
  year?: { min?: number; max?: number };
  rating?: { min?: number; max?: number };
  playCount?: { min?: number; max?: number };
  dateAdded?: { min?: Date; max?: Date };
  lastPlayed?: { min?: Date; max?: Date };
  duration?: { min?: number; max?: number };
  isLiked?: boolean;
  limit?: number;
  sortBy?:
    | "title"
    | "artist"
    | "album"
    | "dateAdded"
    | "lastPlayed"
    | "playCount"
    | "rating"
    | "random";
  sortOrder?: "asc" | "desc";
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffleEnabled: boolean;
  queue: Track[];
  currentIndex: number;
  playbackSpeed: number;
  crossfadeEnabled: boolean;
  crossfadeDuration: number;
}

export type RepeatMode = "off" | "one" | "all";

export interface EqualizerPreset {
  id: string;
  name: string;
  gains: number[]; // Array of 10 frequency band gains (-12 to +12 dB)
  isCustom: boolean;
}

export interface EqualizerState {
  isEnabled: boolean;
  currentPreset: EqualizerPreset;
  customPresets: EqualizerPreset[];
  bassBoost: number;
  trebleBoost: number;
  virtualizer: number;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    shadow: string;
  };
  isDark: boolean;
}

export interface AppSettings {
  theme: Theme;
  audioQuality: "low" | "medium" | "high" | "lossless";
  crossfadeEnabled: boolean;
  crossfadeDuration: number;
  gaplessPlayback: boolean;
  replayGain: boolean;
  showLyrics: boolean;
  showVisualizer: boolean;
  sleepTimer: number | null;
  scrobbleToLastFm: boolean;
  downloadOnWiFiOnly: boolean;
  cacheSize: number;
  language: string;
  notifications: {
    nowPlaying: boolean;
    newReleases: boolean;
    recommendations: boolean;
  };
}

export interface SearchResult {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  query: string;
  totalResults: number;
}

export interface LibraryStats {
  totalTracks: number;
  totalAlbums: number;
  totalArtists: number;
  totalPlaylists: number;
  totalDuration: number;
  totalSize: number;
  mostPlayedTrack: Track | null;
  mostPlayedArtist: Artist | null;
  mostPlayedAlbum: Album | null;
  recentlyAdded: Track[];
  recentlyPlayed: Track[];
}
