import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  PanGestureHandler,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import Slider from "@react-native-community/slider";

const { width, height } = Dimensions.get("window");

const PlayerScreen = () => {
  const navigation = useNavigation();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffleEnabled,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleMute,
    cycleRepeatMode,
    toggleShuffle,
    formatTime,
    getProgressPercentage,
    hasNext,
    hasPrevious,
  } = useAudioPlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tempPosition, setTempPosition] = useState(0);

  const slideAnim = new Animated.Value(0);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // Rotate animation for playing state
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
    }
  }, [isPlaying]);

  const handleSeek = (value: number) => {
    const newPosition = (value / 100) * duration;
    setTempPosition(newPosition);
    if (!isDragging) {
      seekTo(newPosition);
    }
  };

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeekComplete = (value: number) => {
    const newPosition = (value / 100) * duration;
    seekTo(newPosition);
    setIsDragging(false);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "off":
        return "repeat-outline";
      case "all":
        return "repeat";
      case "one":
        return "repeat-outline";
      default:
        return "repeat-outline";
    }
  };

  const getRepeatColor = () => {
    return repeatMode !== "off" ? "#0ea5e9" : "#64748b";
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={64} color="#64748b" />
          <Text style={styles.emptyStateText}>No track selected</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-down" size={28} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Now Playing</Text>
            <Text style={styles.headerSubtitle}>From {currentTrack.album}</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Album Art */}
        <View style={styles.artworkContainer}>
          <View style={styles.artworkShadow}>
            <Animated.View
              style={[
                styles.artworkWrapper,
                {
                  transform: [{ rotate: rotateInterpolate }],
                },
              ]}
            >
              <Image
                source={{
                  uri:
                    currentTrack.artwork || "https://via.placeholder.com/300",
                }}
                style={styles.artwork}
              />
            </Animated.View>
          </View>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons
              name={currentTrack.isLiked ? "heart" : "heart-outline"}
              size={24}
              color={currentTrack.isLiked ? "#ef4444" : "#ffffff"}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={100}
            value={
              isDragging
                ? (tempPosition / duration) * 100
                : getProgressPercentage()
            }
            onValueChange={handleSeek}
            onSlidingStart={handleSeekStart}
            onSlidingComplete={handleSeekComplete}
            minimumTrackTintColor="#ffffff"
            maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
            thumbStyle={styles.sliderThumb}
            trackStyle={styles.sliderTrack}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {formatTime(isDragging ? tempPosition : position)}
            </Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleShuffle}
          >
            <Ionicons
              name={isShuffleEnabled ? "shuffle" : "shuffle-outline"}
              size={24}
              color={isShuffleEnabled ? "#0ea5e9" : "#ffffff"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              !hasPrevious() && styles.disabledButton,
            ]}
            onPress={playPrevious}
            disabled={!hasPrevious()}
          >
            <Ionicons name="play-skip-back" size={32} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <Ionicons name="hourglass-outline" size={40} color="#ffffff" />
            ) : (
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={40}
                color="#ffffff"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !hasNext() && styles.disabledButton]}
            onPress={playNext}
            disabled={!hasNext()}
          >
            <Ionicons name="play-skip-forward" size={32} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={cycleRepeatMode}
          >
            <Ionicons
              name={getRepeatIcon()}
              size={24}
              color={getRepeatColor()}
            />
            {repeatMode === "one" && (
              <View style={styles.repeatOneBadge}>
                <Text style={styles.repeatOneText}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => setShowLyrics(!showLyrics)}
          >
            <Ionicons name="document-text-outline" size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => setShowVolumeSlider(!showVolumeSlider)}
          >
            <Ionicons
              name={isMuted ? "volume-mute" : "volume-high"}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomButton}>
            <Ionicons name="share-outline" size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomButton}>
            <Ionicons name="list-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Volume Slider */}
        {showVolumeSlider && (
          <View style={styles.volumeContainer}>
            <Ionicons name="volume-low" size={20} color="#ffffff" />
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor="#ffffff"
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbStyle={styles.volumeThumb}
            />
            <Ionicons name="volume-high" size={20} color="#ffffff" />
          </View>
        )}

        {/* Lyrics Panel */}
        {showLyrics && (
          <View style={styles.lyricsContainer}>
            <Text style={styles.lyricsTitle}>Lyrics</Text>
            <Text style={styles.lyricsText}>
              {currentTrack.lyrics || "No lyrics available for this track."}
            </Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#64748b",
    marginTop: 16,
    textAlign: "center",
  },
  backButton: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0ea5e9",
    borderRadius: 24,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.7,
    marginTop: 2,
  },
  artworkContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  artworkShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  artworkWrapper: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    overflow: "hidden",
  },
  artwork: {
    width: "100%",
    height: "100%",
  },
  trackInfo: {
    alignItems: "center",
    marginBottom: 40,
  },
  trackTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  trackArtist: {
    fontSize: 18,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 16,
  },
  favoriteButton: {
    padding: 8,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressSlider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: "#ffffff",
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  controlButton: {
    padding: 12,
  },
  disabledButton: {
    opacity: 0.4,
  },
  playButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 40,
    padding: 20,
    marginHorizontal: 20,
  },
  repeatOneBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#0ea5e9",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  repeatOneText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "bold",
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  bottomButton: {
    padding: 12,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 16,
  },
  volumeThumb: {
    width: 16,
    height: 16,
    backgroundColor: "#ffffff",
  },
  lyricsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    maxHeight: 200,
  },
  lyricsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  lyricsText: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
    lineHeight: 20,
  },
});

export default PlayerScreen;
