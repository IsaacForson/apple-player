import * as MediaLibrary from "expo-media-library";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Track } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class MusicImportService {
  private static instance: MusicImportService;
  private importedTracks: Track[] = [];

  private constructor() {
    this.loadImportedTracks();
  }

  public static getInstance(): MusicImportService {
    if (!MusicImportService.instance) {
      MusicImportService.instance = new MusicImportService();
    }
    return MusicImportService.instance;
  }

  // Request permissions for media library access
  public async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Failed to request permissions:", error);
      return false;
    }
  }

  // Import music from device's media library
  public async importFromMediaLibrary(): Promise<Track[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Media library permission denied");
      }

      // Get audio assets from media library
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: "audio",
        first: 1000, // Limit to 1000 tracks for performance
        sortBy: "creationTime",
      });

      const tracks: Track[] = [];

      for (const asset of media.assets) {
        // Get asset info to extract metadata
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);

        const track: Track = {
          id: asset.id,
          title: asset.filename.replace(/\.[^/.]+$/, ""), // Remove file extension
          artist: "Unknown Artist",
          album: "Unknown Album",
          duration: asset.duration * 1000, // Convert to milliseconds
          uri: asset.uri,
          artwork: undefined,
          genre: undefined,
          year: asset.creationTime
            ? new Date(asset.creationTime).getFullYear()
            : undefined,
          dateAdded: new Date(),
          fileSize: (assetInfo as any).fileSize || undefined,
          isLiked: false,
        };

        tracks.push(track);
      }

      // Filter out duplicates based on ID
      const existingIds = new Set(this.importedTracks.map((track) => track.id));
      const newTracks = tracks.filter((track) => !existingIds.has(track.id));

      // Merge with existing imported tracks
      this.importedTracks = [...this.importedTracks, ...newTracks];
      await this.saveImportedTracks();

      return newTracks;
    } catch (error) {
      console.error("Failed to import from media library:", error);
      throw error;
    }
  }

  // Import music files using document picker
  public async importFromFiles(): Promise<Track[]> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return [];
      }

      const tracks: Track[] = [];
      const musicDir = `${FileSystem.documentDirectory}music/`;

      // Ensure music directory exists once
      await FileSystem.makeDirectoryAsync(musicDir, {
        intermediates: true,
      });

      // Process files with better error handling and progress tracking
      for (let i = 0; i < result.assets.length; i++) {
        const file = result.assets[i];
        console.log(
          `Processing file ${i + 1}/${result.assets.length}: ${file.name}`
        );

        try {
          const filename = file.name;

          // Generate unique filename if file already exists
          let destinationUri = `${musicDir}${filename}`;
          let counter = 1;
          while (await this.fileExists(destinationUri)) {
            const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
            const extension = filename.split(".").pop() || "";
            destinationUri = `${musicDir}${nameWithoutExt}_${counter}.${extension}`;
            counter++;
          }

          // Copy file with timeout and better error handling
          console.log(`Copying file: ${filename}`);
          await Promise.race([
            FileSystem.copyAsync({
              from: file.uri,
              to: destinationUri,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Copy timeout")), 30000)
            ),
          ]);

          // Verify file was copied
          const fileInfo = await FileSystem.getInfoAsync(destinationUri);
          if (!fileInfo.exists) {
            console.error(`File ${filename} was not copied successfully`);
            continue;
          }

          // Extract metadata from filename
          const metadata = await this.extractMetadata(filename);

          const track: Track = {
            id: `imported_${Date.now()}_${Math.random()}_${i}`,
            title: metadata.title || filename.replace(/\.[^/.]+$/, ""),
            artist: metadata.artist || "Unknown Artist",
            album: "Unknown Album",
            duration: 0, // Will be updated when loaded
            uri: destinationUri,
            artwork: undefined,
            genre: undefined,
            dateAdded: new Date(),
            fileSize: (fileInfo as any).size || undefined,
            isLiked: false,
          };

          tracks.push(track);
          console.log(`Successfully imported: ${filename}`);
        } catch (error) {
          console.error(`Failed to import file ${file.name}:`, error);
          // Continue with next file instead of stopping
          continue;
        }
      }

      // No need to filter duplicates for file imports since they get unique IDs
      // Merge with existing imported tracks
      this.importedTracks = [...this.importedTracks, ...tracks];
      await this.saveImportedTracks();

      return tracks;
    } catch (error) {
      console.error("Failed to import files:", error);
      throw error;
    }
  }

  // Get all imported tracks
  public getImportedTracks(): Track[] {
    return this.importedTracks;
  }

  // Remove imported track
  public async removeImportedTrack(trackId: string): Promise<void> {
    try {
      const trackIndex = this.importedTracks.findIndex(
        (track) => track.id === trackId
      );
      if (trackIndex === -1) return;

      const track = this.importedTracks[trackIndex];

      // Delete file if it's in our app directory
      if (track.uri.includes(FileSystem.documentDirectory!)) {
        await FileSystem.deleteAsync(track.uri, { idempotent: true });
      }

      // Remove from array
      this.importedTracks.splice(trackIndex, 1);
      await this.saveImportedTracks();
    } catch (error) {
      console.error("Failed to remove imported track:", error);
      throw error;
    }
  }

  // Clear all imported tracks
  public async clearImportedTracks(): Promise<void> {
    try {
      // Delete all files in music directory
      const musicDir = `${FileSystem.documentDirectory}music/`;
      const dirInfo = await FileSystem.getInfoAsync(musicDir);

      if (dirInfo.exists) {
        await FileSystem.deleteAsync(musicDir, { idempotent: true });
      }

      this.importedTracks = [];
      await this.saveImportedTracks();
    } catch (error) {
      console.error("Failed to clear imported tracks:", error);
      throw error;
    }
  }

  // Save imported tracks to storage
  private async saveImportedTracks(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        "importedTracks",
        JSON.stringify(this.importedTracks)
      );
    } catch (error) {
      console.error("Failed to save imported tracks:", error);
    }
  }

  // Load imported tracks from storage
  private async loadImportedTracks(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem("importedTracks");
      if (stored) {
        this.importedTracks = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load imported tracks:", error);
      this.importedTracks = [];
    }
  }

  // Get storage usage
  public async getStorageUsage(): Promise<{ used: number; total: number }> {
    try {
      const musicDir = `${FileSystem.documentDirectory}music/`;
      const dirInfo = await FileSystem.getInfoAsync(musicDir);

      if (!dirInfo.exists) {
        return { used: 0, total: 0 };
      }

      let totalSize = 0;
      const files = await FileSystem.readDirectoryAsync(musicDir);

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${musicDir}${file}`);
        totalSize += (fileInfo as any).size || 0;
      }

      // Get available storage (this is an approximation)
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();

      return {
        used: totalSize,
        total: totalSize + freeSpace,
      };
    } catch (error) {
      console.error("Failed to get storage usage:", error);
      return { used: 0, total: 0 };
    }
  }

  // Check if file exists
  private async fileExists(uri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return fileInfo.exists;
    } catch (error) {
      return false;
    }
  }

  // Extract metadata from audio file (basic implementation)
  private async extractMetadata(uri: string): Promise<Partial<Track>> {
    try {
      // This is a basic implementation
      // In a real app, you might want to use a library like react-native-audio-metadata
      const filename = uri.split("/").pop() || "";
      const parts = filename.replace(/\.[^/.]+$/, "").split(" - ");

      if (parts.length >= 2) {
        return {
          artist: parts[0].trim(),
          title: parts[1].trim(),
        };
      }

      return {
        title: filename.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist",
      };
    } catch (error) {
      console.error("Failed to extract metadata:", error);
      return {};
    }
  }
}
