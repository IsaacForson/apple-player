import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { Track } from "../types";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    formatTime,
    position,
    duration,
    getProgressPercentage,
  } = useAudioPlayer();

  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would load from storage or API
    const mockTracks: Track[] = [
      {
        id: "1",
        title: "Bohemian Rhapsody",
        artist: "Queen",
        album: "A Night at the Opera",
        duration: 355000,
        uri: "https://example.com/bohemian-rhapsody.mp3",
        artwork: "https://example.com/queen-artwork.jpg",
        genre: "Rock",
        year: 1975,
        dateAdded: new Date(),
        isLiked: true,
      },
      {
        id: "2",
        title: "Stairway to Heaven",
        artist: "Led Zeppelin",
        album: "Led Zeppelin IV",
        duration: 482000,
        uri: "https://example.com/stairway-to-heaven.mp3",
        artwork: "https://example.com/led-zeppelin-artwork.jpg",
        genre: "Rock",
        year: 1971,
        dateAdded: new Date(),
        isLiked: false,
      },
      {
        id: "3",
        title: "Hotel California",
        artist: "Eagles",
        album: "Hotel California",
        duration: 391000,
        uri: "https://example.com/hotel-california.mp3",
        artwork: "https://example.com/eagles-artwork.jpg",
        genre: "Rock",
        year: 1976,
        dateAdded: new Date(),
        isLiked: true,
      },
    ];

    setRecentTracks(mockTracks);
    setRecommendedTracks(mockTracks.reverse());
  }, []);

  const NowPlayingCard = () => {
    if (!currentTrack) return null;

    return (
      <TouchableOpacity
        style={styles.nowPlayingCard}
        onPress={() => navigation.navigate("Player" as never)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.nowPlayingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.nowPlayingContent}>
            <View style={styles.nowPlayingInfo}>
              <Image
                source={{
                  uri: currentTrack.artwork || "https://via.placeholder.com/60",
                }}
                style={styles.nowPlayingArtwork}
              />
              <View style={styles.nowPlayingText}>
                <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.nowPlayingArtist} numberOfLines={1}>
                  {currentTrack.artist}
                </Text>
                <View style={styles.nowPlayingProgress}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${getProgressPercentage()}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressTime}>
                    {formatTime(position)} / {formatTime(duration)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.nowPlayingControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={playPrevious}
              >
                <Ionicons name="play-skip-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playButton}
                onPress={togglePlayPause}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={32}
                  color="#ffffff"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={playNext}>
                <Ionicons name="play-skip-forward" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const QuickAccessCard = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity
      style={styles.quickAccessCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        style={styles.quickAccessGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={32} color="#ffffff" />
        <Text style={styles.quickAccessTitle}>{title}</Text>
        <Text style={styles.quickAccessSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const TrackItem = ({
    track,
    onPress,
  }: {
    track: Track;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: track.artwork || "https://via.placeholder.com/50" }}
        style={styles.trackArtwork}
      />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      <View style={styles.trackActions}>
        <TouchableOpacity style={styles.trackAction}>
          <Ionicons
            name={track.isLiked ? "heart" : "heart-outline"}
            size={20}
            color={track.isLiked ? "#ef4444" : "#64748b"}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.trackAction}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.headerTitle}>Ready to listen?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={32} color="#0ea5e9" />
          </TouchableOpacity>
        </View>

        {/* Now Playing Card */}
        <NowPlayingCard />

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <QuickAccessCard
              icon="library"
              title="Your Library"
              subtitle="All your music"
              onPress={() => navigation.navigate("Library" as never)}
            />
            <QuickAccessCard
              icon="heart"
              title="Liked Songs"
              subtitle="Your favorites"
              onPress={() => {}}
            />
            <QuickAccessCard
              icon="download"
              title="Downloaded"
              subtitle="Offline music"
              onPress={() => {}}
            />
            <QuickAccessCard
              icon="time"
              title="Recently Played"
              subtitle="Your history"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Recent Tracks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Played</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tracksList}>
            {recentTracks.map((track) => (
              <TrackItem
                key={track.id}
                track={track}
                onPress={() => {
                  // Handle track selection
                }}
              />
            ))}
          </View>
        </View>

        {/* Recommended */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tracksList}>
            {recommendedTracks.map((track) => (
              <TrackItem
                key={track.id}
                track={track}
                onPress={() => {
                  // Handle track selection
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  nowPlayingCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nowPlayingGradient: {
    padding: 20,
  },
  nowPlayingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nowPlayingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  nowPlayingArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  nowPlayingText: {
    flex: 1,
  },
  nowPlayingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  nowPlayingArtist: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
    marginBottom: 8,
  },
  nowPlayingProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },
  progressTime: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
  },
  nowPlayingControls: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    padding: 12,
    marginHorizontal: 8,
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  seeAllText: {
    fontSize: 14,
    color: "#0ea5e9",
    fontWeight: "600",
  },
  quickAccessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAccessCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickAccessGradient: {
    padding: 20,
    alignItems: "center",
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 12,
    textAlign: "center",
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
    marginTop: 4,
    textAlign: "center",
  },
  tracksList: {
    gap: 12,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
  },
  trackArtwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: "#64748b",
  },
  trackActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackAction: {
    padding: 8,
  },
});

export default HomeScreen;
