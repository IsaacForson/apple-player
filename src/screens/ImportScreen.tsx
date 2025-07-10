import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MusicImportService } from "../services/MusicImportService";
import { Track } from "../types";
import { useTheme } from "../hooks/useTheme";
import { formatFileSize, formatDuration } from "../utils/formatters";

export const ImportScreen: React.FC = () => {
  const { theme } = useTheme();
  const [importedTracks, setImportedTracks] = useState<Track[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0 });
  const importService = MusicImportService.getInstance();

  useEffect(() => {
    loadImportedTracks();
    loadStorageUsage();
  }, []);

  const loadImportedTracks = () => {
    const tracks = importService.getImportedTracks();
    setImportedTracks(tracks);
  };

  const loadStorageUsage = async () => {
    try {
      const usage = await importService.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error("Failed to load storage usage:", error);
    }
  };

  const handleImportFromMediaLibrary = async () => {
    try {
      setIsImporting(true);
      setImportProgress("Requesting permissions...");

      const tracks = await importService.importFromMediaLibrary();

      if (tracks.length === 0) {
        Alert.alert(
          "No Music Found",
          "No audio files were found in your media library."
        );
      } else {
        Alert.alert(
          "Import Complete",
          `Successfully imported ${tracks.length} tracks from your media library.`
        );
      }

      loadImportedTracks();
      loadStorageUsage();
    } catch (error) {
      console.error("Import failed:", error);
      Alert.alert(
        "Import Failed",
        error instanceof Error
          ? error.message
          : "Failed to import music from media library."
      );
    } finally {
      setIsImporting(false);
      setImportProgress("");
    }
  };

  const handleImportFromFiles = async () => {
    try {
      setIsImporting(true);
      setImportProgress("Opening file picker...");

      // Add progress tracking
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        const message = args.join(" ");
        if (message.includes("Processing file")) {
          setImportProgress(message);
        } else if (message.includes("Copying file")) {
          setImportProgress(`Copying: ${message.split(": ")[1]}`);
        } else if (message.includes("Successfully imported")) {
          setImportProgress(`Imported: ${message.split(": ")[1]}`);
        }
        originalConsoleLog(...args);
      };

      const tracks = await importService.importFromFiles();

      // Restore console.log
      console.log = originalConsoleLog;

      if (tracks.length === 0) {
        Alert.alert(
          "No Files Selected",
          "No audio files were selected for import."
        );
      } else {
        Alert.alert(
          "Import Complete",
          `Successfully imported ${tracks.length} audio files.`
        );
      }

      loadImportedTracks();
      loadStorageUsage();
    } catch (error) {
      console.error("Import failed:", error);
      Alert.alert(
        "Import Failed",
        error instanceof Error ? error.message : "Failed to import audio files."
      );
    } finally {
      setIsImporting(false);
      setImportProgress("");
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    try {
      await importService.removeImportedTrack(trackId);
      loadImportedTracks();
      loadStorageUsage();
    } catch (error) {
      console.error("Failed to remove track:", error);
      Alert.alert("Error", "Failed to remove track.");
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Imported Music",
      "Are you sure you want to remove all imported music? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await importService.clearImportedTracks();
              loadImportedTracks();
              loadStorageUsage();
            } catch (error) {
              console.error("Failed to clear tracks:", error);
              Alert.alert("Error", "Failed to clear imported music.");
            }
          },
        },
      ]
    );
  };

  const renderTrackItem = ({ item }: { item: Track }) => (
    <View style={[styles.trackItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.trackInfo}>
        <Text
          style={[styles.trackTitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.trackArtist, { color: theme.colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.artist}
        </Text>
        <View style={styles.trackMeta}>
          <Text
            style={[
              styles.trackMetaText,
              { color: theme.colors.textSecondary },
            ]}
          >
            {formatDuration(item.duration)}
          </Text>
          {item.fileSize && (
            <Text
              style={[
                styles.trackMetaText,
                { color: theme.colors.textSecondary },
              ]}
            >
              • {formatFileSize(item.fileSize)}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveTrack(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  const storagePercentage =
    storageUsage.total > 0 ? (storageUsage.used / storageUsage.total) * 100 : 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Import Music
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Add music from your device to your library
          </Text>
        </View>

        {/* Storage Usage */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="server-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Storage Usage
            </Text>
          </View>
          <View style={styles.storageBar}>
            <View
              style={[
                styles.storageBarFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${Math.min(storagePercentage, 100)}%`,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.storageText, { color: theme.colors.textSecondary }]}
          >
            {formatFileSize(storageUsage.used)} used of{" "}
            {formatFileSize(storageUsage.total)} available
          </Text>
        </View>

        {/* Import Options */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="download-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Import Options
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.importButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleImportFromMediaLibrary}
            disabled={isImporting}
          >
            <Ionicons name="library-outline" size={24} color="white" />
            <View style={styles.importButtonText}>
              <Text style={styles.importButtonTitle}>From Media Library</Text>
              <Text style={styles.importButtonSubtitle}>
                Import music from your device's media library
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.importButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleImportFromFiles}
            disabled={isImporting}
          >
            <Ionicons name="folder-outline" size={24} color="white" />
            <View style={styles.importButtonText}>
              <Text style={styles.importButtonTitle}>From Files</Text>
              <Text style={styles.importButtonSubtitle}>
                Select audio files from your device storage
              </Text>
            </View>
          </TouchableOpacity>

          {isImporting && (
            <View style={styles.importProgress}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text
                style={[
                  styles.importProgressText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {importProgress}
              </Text>
            </View>
          )}
        </View>

        {/* Imported Tracks */}
        {importedTracks.length > 0 && (
          <View
            style={[styles.section, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons
                name="musical-notes-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Imported Tracks ({importedTracks.length})
              </Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearAll}
              >
                <Text
                  style={[
                    styles.clearButtonText,
                    { color: theme.colors.error },
                  ]}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={importedTracks}
              renderItem={renderTrackItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              )}
            />
          </View>
        )}

        {/* Empty State */}
        {importedTracks.length === 0 && !isImporting && (
          <View style={styles.emptyState}>
            <Ionicons
              name="musical-notes-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[styles.emptyStateTitle, { color: theme.colors.text }]}
            >
              No Imported Music
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Import music from your device to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    margin: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  storageBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    marginBottom: 8,
  },
  storageBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  storageText: {
    fontSize: 14,
  },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  importButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  importButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  importButtonSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  importProgress: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  importProgressText: {
    marginLeft: 8,
    fontSize: 14,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    marginBottom: 4,
  },
  trackMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackMetaText: {
    fontSize: 12,
  },
  removeButton: {
    padding: 8,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
