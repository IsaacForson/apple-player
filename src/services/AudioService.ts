import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import { Track, PlayerState, RepeatMode } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class AudioService {
  private static instance: AudioService;
  private sound: Audio.Sound | null = null;
  private currentTrack: Track | null = null;
  private queue: Track[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private isLoading: boolean = false;
  private position: number = 0;
  private duration: number = 0;
  private volume: number = 1.0;
  private isMuted: boolean = false;
  private repeatMode: RepeatMode = "off";
  private isShuffleEnabled: boolean = false;
  private playbackSpeed: number = 1.0;
  private crossfadeEnabled: boolean = false;
  private crossfadeDuration: number = 3;
  private listeners: Array<(state: PlayerState) => void> = [];
  private positionUpdateInterval: NodeJS.Timeout | null = null;
  private sleepTimer: NodeJS.Timeout | null = null;
  private originalQueue: Track[] = [];
  private shuffledIndices: number[] = [];

  private constructor() {
    this.setupAudioMode();
    this.loadPlayerState();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private async setupAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error("Failed to setup audio mode:", error);
    }
  }

  private async loadPlayerState() {
    try {
      const savedState = await AsyncStorage.getItem("playerState");
      if (savedState) {
        const state = JSON.parse(savedState);
        this.volume = state.volume || 1.0;
        this.repeatMode = state.repeatMode || "off";
        this.isShuffleEnabled = state.isShuffleEnabled || false;
        this.playbackSpeed = state.playbackSpeed || 1.0;
        this.crossfadeEnabled = state.crossfadeEnabled || false;
        this.crossfadeDuration = state.crossfadeDuration || 3;
      }
    } catch (error) {
      console.error("Failed to load player state:", error);
    }
  }

  private async savePlayerState() {
    try {
      const state = {
        volume: this.volume,
        repeatMode: this.repeatMode,
        isShuffleEnabled: this.isShuffleEnabled,
        playbackSpeed: this.playbackSpeed,
        crossfadeEnabled: this.crossfadeEnabled,
        crossfadeDuration: this.crossfadeDuration,
      };
      await AsyncStorage.setItem("playerState", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save player state:", error);
    }
  }

  public subscribe(listener: (state: PlayerState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    const state: PlayerState = {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isLoading: this.isLoading,
      position: this.position,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      repeatMode: this.repeatMode,
      isShuffleEnabled: this.isShuffleEnabled,
      queue: this.queue,
      currentIndex: this.currentIndex,
      playbackSpeed: this.playbackSpeed,
      crossfadeEnabled: this.crossfadeEnabled,
      crossfadeDuration: this.crossfadeDuration,
    };

    this.listeners.forEach((listener) => listener(state));
  }

  private startPositionUpdates() {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
    }

    this.positionUpdateInterval = setInterval(async () => {
      if (this.sound && this.isPlaying) {
        try {
          const status = await this.sound.getStatusAsync();
          if (status.isLoaded) {
            this.position = status.positionMillis || 0;
            this.duration = status.durationMillis || 0;
            this.notifyListeners();

            // Check if track ended
            if (this.position >= this.duration - 100 && this.duration > 0) {
              await this.handleTrackEnd();
            }
          }
        } catch (error) {
          console.error("Failed to get playback status:", error);
        }
      }
    }, 100);
  }

  private stopPositionUpdates() {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
      this.positionUpdateInterval = null;
    }
  }

  private async handleTrackEnd() {
    if (this.repeatMode === "one") {
      await this.seekTo(0);
      await this.play();
    } else {
      await this.playNext();
    }
  }

  private getNextIndex(): number {
    if (this.isShuffleEnabled) {
      const currentShuffledIndex = this.shuffledIndices.indexOf(
        this.currentIndex
      );
      const nextShuffledIndex =
        (currentShuffledIndex + 1) % this.shuffledIndices.length;
      return this.shuffledIndices[nextShuffledIndex];
    } else {
      return (this.currentIndex + 1) % this.queue.length;
    }
  }

  private getPreviousIndex(): number {
    if (this.isShuffleEnabled) {
      const currentShuffledIndex = this.shuffledIndices.indexOf(
        this.currentIndex
      );
      const prevShuffledIndex =
        currentShuffledIndex === 0
          ? this.shuffledIndices.length - 1
          : currentShuffledIndex - 1;
      return this.shuffledIndices[prevShuffledIndex];
    } else {
      return this.currentIndex === 0
        ? this.queue.length - 1
        : this.currentIndex - 1;
    }
  }

  private generateShuffledIndices() {
    this.shuffledIndices = Array.from(
      { length: this.queue.length },
      (_, i) => i
    );

    // Fisher-Yates shuffle
    for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledIndices[i], this.shuffledIndices[j]] = [
        this.shuffledIndices[j],
        this.shuffledIndices[i],
      ];
    }

    // Ensure current track stays at the beginning of shuffle
    const currentIndexInShuffle = this.shuffledIndices.indexOf(
      this.currentIndex
    );
    if (currentIndexInShuffle !== 0) {
      [this.shuffledIndices[0], this.shuffledIndices[currentIndexInShuffle]] = [
        this.shuffledIndices[currentIndexInShuffle],
        this.shuffledIndices[0],
      ];
    }
  }

  public async loadTrack(track: Track): Promise<void> {
    try {
      this.isLoading = true;
      this.notifyListeners();

      // Unload previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: false,
          volume: this.isMuted ? 0 : this.volume,
          rate: this.playbackSpeed,
          shouldCorrectPitch: true,
          isLooping: this.repeatMode === "one",
        }
      );

      this.sound = sound;
      this.currentTrack = track;
      this.position = 0;
      this.isLoading = false;

      // Update play count and last played
      if (this.currentTrack) {
        this.currentTrack.playCount = (this.currentTrack.playCount || 0) + 1;
        this.currentTrack.lastPlayed = new Date();
      }

      this.notifyListeners();
    } catch (error) {
      console.error("Failed to load track:", error);
      this.isLoading = false;
      this.notifyListeners();
      throw error;
    }
  }

  public async play(): Promise<void> {
    try {
      if (!this.sound) {
        if (this.currentTrack) {
          await this.loadTrack(this.currentTrack);
        } else if (this.queue.length > 0) {
          await this.loadTrack(this.queue[this.currentIndex]);
        } else {
          return;
        }
      }

      await this.sound.playAsync();
      this.isPlaying = true;
      this.isPaused = false;
      this.startPositionUpdates();
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to play:", error);
      throw error;
    }
  }

  public async pause(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
        this.isPaused = true;
        this.stopPositionUpdates();
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to pause:", error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        this.isPlaying = false;
        this.isPaused = false;
        this.position = 0;
        this.stopPositionUpdates();
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to stop:", error);
      throw error;
    }
  }

  public async playNext(): Promise<void> {
    if (this.queue.length === 0) return;

    const nextIndex = this.getNextIndex();

    if (
      nextIndex === 0 &&
      this.repeatMode === "off" &&
      !this.isShuffleEnabled
    ) {
      // End of queue reached
      await this.stop();
      return;
    }

    this.currentIndex = nextIndex;
    await this.loadTrack(this.queue[this.currentIndex]);
    await this.play();
  }

  public async playPrevious(): Promise<void> {
    if (this.queue.length === 0) return;

    // If we're more than 3 seconds into the track, restart current track
    if (this.position > 3000) {
      await this.seekTo(0);
      return;
    }

    const prevIndex = this.getPreviousIndex();
    this.currentIndex = prevIndex;
    await this.loadTrack(this.queue[this.currentIndex]);
    await this.play();
  }

  public async seekTo(position: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(position);
        this.position = position;
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to seek:", error);
      throw error;
    }
  }

  public async setVolume(volume: number): Promise<void> {
    try {
      this.volume = Math.max(0, Math.min(1, volume));
      if (this.sound && !this.isMuted) {
        await this.sound.setVolumeAsync(this.volume);
      }
      this.savePlayerState();
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to set volume:", error);
      throw error;
    }
  }

  public async toggleMute(): Promise<void> {
    try {
      this.isMuted = !this.isMuted;
      if (this.sound) {
        await this.sound.setVolumeAsync(this.isMuted ? 0 : this.volume);
      }
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to toggle mute:", error);
      throw error;
    }
  }

  public async setPlaybackSpeed(speed: number): Promise<void> {
    try {
      this.playbackSpeed = speed;
      if (this.sound) {
        await this.sound.setRateAsync(speed, true);
      }
      this.savePlayerState();
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to set playback speed:", error);
      throw error;
    }
  }

  public setRepeatMode(mode: RepeatMode): void {
    this.repeatMode = mode;
    if (this.sound) {
      this.sound.setIsLoopingAsync(mode === "one");
    }
    this.savePlayerState();
    this.notifyListeners();
  }

  public toggleShuffle(): void {
    this.isShuffleEnabled = !this.isShuffleEnabled;

    if (this.isShuffleEnabled) {
      this.generateShuffledIndices();
    }

    this.savePlayerState();
    this.notifyListeners();
  }

  public setQueue(tracks: Track[], startIndex: number = 0): void {
    this.queue = [...tracks];
    this.originalQueue = [...tracks];
    this.currentIndex = startIndex;

    if (this.isShuffleEnabled) {
      this.generateShuffledIndices();
    }

    this.notifyListeners();
  }

  public addToQueue(track: Track): void {
    this.queue.push(track);
    this.originalQueue.push(track);

    if (this.isShuffleEnabled) {
      this.generateShuffledIndices();
    }

    this.notifyListeners();
  }

  public removeFromQueue(index: number): void {
    if (index >= 0 && index < this.queue.length) {
      this.queue.splice(index, 1);
      this.originalQueue.splice(index, 1);

      if (index < this.currentIndex) {
        this.currentIndex--;
      } else if (index === this.currentIndex && this.queue.length > 0) {
        this.currentIndex = Math.min(this.currentIndex, this.queue.length - 1);
      }

      if (this.isShuffleEnabled) {
        this.generateShuffledIndices();
      }

      this.notifyListeners();
    }
  }

  public clearQueue(): void {
    this.queue = [];
    this.originalQueue = [];
    this.shuffledIndices = [];
    this.currentIndex = 0;
    this.notifyListeners();
  }

  public setSleepTimer(minutes: number | null): void {
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
      this.sleepTimer = null;
    }

    if (minutes && minutes > 0) {
      this.sleepTimer = setTimeout(async () => {
        await this.pause();
        this.sleepTimer = null;
      }, minutes * 60 * 1000);
    }
  }

  public getState(): PlayerState {
    return {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isLoading: this.isLoading,
      position: this.position,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      repeatMode: this.repeatMode,
      isShuffleEnabled: this.isShuffleEnabled,
      queue: this.queue,
      currentIndex: this.currentIndex,
      playbackSpeed: this.playbackSpeed,
      crossfadeEnabled: this.crossfadeEnabled,
      crossfadeDuration: this.crossfadeDuration,
    };
  }

  public async cleanup(): Promise<void> {
    try {
      this.stopPositionUpdates();

      if (this.sleepTimer) {
        clearTimeout(this.sleepTimer);
        this.sleepTimer = null;
      }

      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      this.listeners = [];
    } catch (error) {
      console.error("Failed to cleanup audio service:", error);
    }
  }
}
