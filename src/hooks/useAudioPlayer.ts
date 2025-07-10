import { useState, useEffect, useCallback } from "react";
import { AudioService } from "../services/AudioService";
import { PlayerState, Track, RepeatMode } from "../types";

export const useAudioPlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    position: 0,
    duration: 0,
    volume: 1.0,
    isMuted: false,
    repeatMode: "off",
    isShuffleEnabled: false,
    queue: [],
    currentIndex: 0,
    playbackSpeed: 1.0,
    crossfadeEnabled: false,
    crossfadeDuration: 3,
  });

  const audioService = AudioService.getInstance();

  useEffect(() => {
    const unsubscribe = audioService.subscribe((state: PlayerState) => {
      setPlayerState(state);
    });

    // Initialize with current state
    setPlayerState(audioService.getState());

    return unsubscribe;
  }, [audioService]);

  const play = useCallback(async () => {
    try {
      await audioService.play();
    } catch (error) {
      console.error("Failed to play:", error);
    }
  }, [audioService]);

  const pause = useCallback(async () => {
    try {
      await audioService.pause();
    } catch (error) {
      console.error("Failed to pause:", error);
    }
  }, [audioService]);

  const stop = useCallback(async () => {
    try {
      await audioService.stop();
    } catch (error) {
      console.error("Failed to stop:", error);
    }
  }, [audioService]);

  const playNext = useCallback(async () => {
    try {
      await audioService.playNext();
    } catch (error) {
      console.error("Failed to play next:", error);
    }
  }, [audioService]);

  const playPrevious = useCallback(async () => {
    try {
      await audioService.playPrevious();
    } catch (error) {
      console.error("Failed to play previous:", error);
    }
  }, [audioService]);

  const seekTo = useCallback(
    async (position: number) => {
      try {
        await audioService.seekTo(position);
      } catch (error) {
        console.error("Failed to seek:", error);
      }
    },
    [audioService]
  );

  const setVolume = useCallback(
    async (volume: number) => {
      try {
        await audioService.setVolume(volume);
      } catch (error) {
        console.error("Failed to set volume:", error);
      }
    },
    [audioService]
  );

  const toggleMute = useCallback(async () => {
    try {
      await audioService.toggleMute();
    } catch (error) {
      console.error("Failed to toggle mute:", error);
    }
  }, [audioService]);

  const setPlaybackSpeed = useCallback(
    async (speed: number) => {
      try {
        await audioService.setPlaybackSpeed(speed);
      } catch (error) {
        console.error("Failed to set playback speed:", error);
      }
    },
    [audioService]
  );

  const setRepeatMode = useCallback(
    (mode: RepeatMode) => {
      audioService.setRepeatMode(mode);
    },
    [audioService]
  );

  const toggleShuffle = useCallback(() => {
    audioService.toggleShuffle();
  }, [audioService]);

  const playTrack = useCallback(
    async (track: Track) => {
      try {
        await audioService.loadTrack(track);
        await audioService.play();
      } catch (error) {
        console.error("Failed to play track:", error);
      }
    },
    [audioService]
  );

  const setQueue = useCallback(
    (tracks: Track[], startIndex: number = 0) => {
      audioService.setQueue(tracks, startIndex);
    },
    [audioService]
  );

  const addToQueue = useCallback(
    (track: Track) => {
      audioService.addToQueue(track);
    },
    [audioService]
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      audioService.removeFromQueue(index);
    },
    [audioService]
  );

  const clearQueue = useCallback(() => {
    audioService.clearQueue();
  }, [audioService]);

  const setSleepTimer = useCallback(
    (minutes: number | null) => {
      audioService.setSleepTimer(minutes);
    },
    [audioService]
  );

  const togglePlayPause = useCallback(async () => {
    if (playerState.isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [playerState.isPlaying, play, pause]);

  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  }, []);

  const getProgressPercentage = useCallback((): number => {
    if (playerState.duration === 0) return 0;
    return (playerState.position / playerState.duration) * 100;
  }, [playerState.position, playerState.duration]);

  const getRemainingTime = useCallback((): string => {
    const remaining = playerState.duration - playerState.position;
    return formatTime(remaining);
  }, [playerState.duration, playerState.position, formatTime]);

  const getCurrentTime = useCallback((): string => {
    return formatTime(playerState.position);
  }, [playerState.position, formatTime]);

  const getTotalTime = useCallback((): string => {
    return formatTime(playerState.duration);
  }, [playerState.duration, formatTime]);

  const getNextRepeatMode = useCallback((): RepeatMode => {
    switch (playerState.repeatMode) {
      case "off":
        return "all";
      case "all":
        return "one";
      case "one":
        return "off";
      default:
        return "off";
    }
  }, [playerState.repeatMode]);

  const cycleRepeatMode = useCallback(() => {
    const nextMode = getNextRepeatMode();
    setRepeatMode(nextMode);
  }, [getNextRepeatMode, setRepeatMode]);

  const hasNext = useCallback((): boolean => {
    if (playerState.queue.length === 0) return false;
    if (playerState.repeatMode === "all") return true;
    if (playerState.isShuffleEnabled) return true;
    return playerState.currentIndex < playerState.queue.length - 1;
  }, [
    playerState.queue.length,
    playerState.repeatMode,
    playerState.isShuffleEnabled,
    playerState.currentIndex,
  ]);

  const hasPrevious = useCallback((): boolean => {
    if (playerState.queue.length === 0) return false;
    if (playerState.repeatMode === "all") return true;
    if (playerState.isShuffleEnabled) return true;
    return playerState.currentIndex > 0 || playerState.position > 3000;
  }, [
    playerState.queue.length,
    playerState.repeatMode,
    playerState.isShuffleEnabled,
    playerState.currentIndex,
    playerState.position,
  ]);

  return {
    // State
    ...playerState,

    // Actions
    play,
    pause,
    stop,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackSpeed,
    setRepeatMode,
    toggleShuffle,
    playTrack,
    setQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setSleepTimer,
    togglePlayPause,
    cycleRepeatMode,

    // Computed values
    formatTime,
    getProgressPercentage,
    getRemainingTime,
    getCurrentTime,
    getTotalTime,
    hasNext,
    hasPrevious,
    getNextRepeatMode,
  };
};
