import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoPlay: true,
    highQuality: false,
    downloadOnWiFi: true,
    showLyrics: true,
    crossfade: false,
    gaplessPlayback: true,
  });

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    value,
    onToggle,
    showSwitch = true,
    onPress,
  }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress || (() => showSwitch && onToggle())}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color="#0ea5e9" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#e2e8f0", true: "#0ea5e9" }}
          thumbColor={value ? "#ffffff" : "#f4f3f4"}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Appearance" />
        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          subtitle="Switch to dark theme"
          value={settings.darkMode}
          onToggle={() => toggleSetting("darkMode")}
        />
        <SettingItem
          icon="color-palette-outline"
          title="Themes"
          subtitle="Choose your favorite theme"
          showSwitch={false}
          onPress={() => {}}
        />

        <SectionHeader title="Audio" />
        <SettingItem
          icon="musical-notes-outline"
          title="High Quality Audio"
          subtitle="Use more data for better sound"
          value={settings.highQuality}
          onToggle={() => toggleSetting("highQuality")}
        />
        <SettingItem
          icon="shuffle-outline"
          title="Crossfade"
          subtitle="Smooth transitions between songs"
          value={settings.crossfade}
          onToggle={() => toggleSetting("crossfade")}
        />
        <SettingItem
          icon="play-outline"
          title="Gapless Playback"
          subtitle="No silence between tracks"
          value={settings.gaplessPlayback}
          onToggle={() => toggleSetting("gaplessPlayback")}
        />
        <SettingItem
          icon="equalizer-outline"
          title="Equalizer"
          subtitle="Adjust sound frequencies"
          showSwitch={false}
          onPress={() => {}}
        />

        <SectionHeader title="Playback" />
        <SettingItem
          icon="play-circle-outline"
          title="Auto Play"
          subtitle="Continue playing similar music"
          value={settings.autoPlay}
          onToggle={() => toggleSetting("autoPlay")}
        />
        <SettingItem
          icon="document-text-outline"
          title="Show Lyrics"
          subtitle="Display lyrics when available"
          value={settings.showLyrics}
          onToggle={() => toggleSetting("showLyrics")}
        />
        <SettingItem
          icon="timer-outline"
          title="Sleep Timer"
          subtitle="Auto-pause after a set time"
          showSwitch={false}
          onPress={() => {}}
        />

        <SectionHeader title="Downloads" />
        <SettingItem
          icon="wifi-outline"
          title="Download on Wi-Fi Only"
          subtitle="Save mobile data"
          value={settings.downloadOnWiFi}
          onToggle={() => toggleSetting("downloadOnWiFi")}
        />
        <SettingItem
          icon="cloud-download-outline"
          title="Storage"
          subtitle="Manage downloaded music"
          showSwitch={false}
          onPress={() => {}}
        />

        <SectionHeader title="Notifications" />
        <SettingItem
          icon="notifications-outline"
          title="Push Notifications"
          subtitle="Get notified about new releases"
          value={settings.notifications}
          onToggle={() => toggleSetting("notifications")}
        />

        <SectionHeader title="About" />
        <SettingItem
          icon="information-circle-outline"
          title="About"
          subtitle="Version 1.0.0"
          showSwitch={false}
          onPress={() => {}}
        />
        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help and contact us"
          showSwitch={false}
          onPress={() => {}}
        />
        <SettingItem
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          subtitle="How we handle your data"
          showSwitch={false}
          onPress={() => {}}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for music lovers</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 32,
    marginBottom: 16,
    marginHorizontal: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  footer: {
    padding: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
});

export default SettingsScreen;
