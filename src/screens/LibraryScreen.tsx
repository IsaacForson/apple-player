import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MusicImportService } from "../services/MusicImportService";
import { AudioService } from "../services/AudioService";
import { Track } from "../types";
import { formatDuration } from "../utils/formatters";
import { useNavigation } from "@react-navigation/native";

const LibraryScreen = () => {
  const [selectedTab, setSelectedTab] = useState("Songs");
  const [importedTracks, setImportedTracks] = useState<Track[]>([]);
  const navigation = useNavigation();

  const tabs = ["Songs", "Albums", "Artists", "Playlists"];
  const importService = MusicImportService.getInstance();
  const audioService = AudioService.getInstance();

  useEffect(() => {
    loadImportedTracks();

    // Listen for navigation focus to refresh tracks
    const unsubscribe = navigation.addListener("focus", () => {
      loadImportedTracks();
    });

    return unsubscribe;
  }, [navigation]);

  const loadImportedTracks = () => {
    const tracks = importService.getImportedTracks();
    setImportedTracks(tracks);
  };

  const handleTrackPress = async (track: Track, index: number) => {
    try {
      // Set the queue to all imported tracks and play the selected one
      audioService.setQueue(importedTracks, index);
      await audioService.loadTrack(track);
      await audioService.play();

      // Navigate to player screen
      (navigation as any).navigate("Player");
    } catch (error) {
      console.error("Failed to play track:", error);
    }
  };

  const TabButton = ({ title, isSelected, onPress }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, isSelected && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderTrackItem = ({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handleTrackPress(item, index)}
    >
      <View style={styles.trackArtwork}>
        <Ionicons name="musical-note" size={24} color="#64748b" />
      </View>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (selectedTab === "Songs") {
      if (importedTracks.length === 0) {
        return (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={64} color="#64748b" />
            <Text style={styles.emptyStateTitle}>No Songs Yet</Text>
            <Text style={styles.emptyStateText}>
              Import music to your library to see it here
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => (navigation as any).navigate("Import")}
            >
              <Ionicons name="add" size={24} color="#ffffff" />
              <Text style={styles.addButtonText}>Import Music</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <FlatList
          data={importedTracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.trackList}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    // For other tabs, show empty state
    return (
      <View style={styles.emptyState}>
        <Ionicons name="musical-notes-outline" size={64} color="#64748b" />
        <Text style={styles.emptyStateTitle}>No {selectedTab} Yet</Text>
        <Text style={styles.emptyStateText}>This feature is coming soon</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            title={tab}
            isSelected={selectedTab === tab}
            onPress={() => setSelectedTab(tab)}
          />
        ))}
      </ScrollView>

      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
  },
  headerButton: {
    padding: 8,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  tabButtonActive: {
    backgroundColor: "#0ea5e9",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  trackList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 8,
  },
  trackArtwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
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
  trackDuration: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
});

export default LibraryScreen;
