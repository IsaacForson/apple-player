import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filters = ["All", "Songs", "Albums", "Artists", "Playlists"];
  const recentSearches = [
    "Queen",
    "Bohemian Rhapsody",
    "Classic Rock",
    "The Beatles",
  ];

  const FilterButton = ({ title, isSelected, onPress }: any) => (
    <TouchableOpacity
      style={[styles.filterButton, isSelected && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const RecentSearchItem = ({ query, onPress }: any) => (
    <TouchableOpacity style={styles.recentItem} onPress={onPress}>
      <Ionicons name="time-outline" size={20} color="#64748b" />
      <Text style={styles.recentText}>{query}</Text>
      <TouchableOpacity style={styles.removeButton}>
        <Ionicons name="close" size={16} color="#64748b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filters.map((filter) => (
          <FilterButton
            key={filter}
            title={filter}
            isSelected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
          />
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {searchQuery.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.map((query, index) => (
                <RecentSearchItem
                  key={index}
                  query={query}
                  onPress={() => setSearchQuery(query)}
                />
              ))}
            </View>

            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              <View style={styles.categoriesGrid}>
                {[
                  "Rock",
                  "Pop",
                  "Jazz",
                  "Classical",
                  "Hip-Hop",
                  "Electronic",
                ].map((category) => (
                  <TouchableOpacity key={category} style={styles.categoryCard}>
                    <Text style={styles.categoryText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.searchResults}>
            <Text style={styles.resultsTitle}>Search Results</Text>
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={64} color="#64748b" />
              <Text style={styles.noResultsTitle}>No results found</Text>
              <Text style={styles.noResultsText}>
                Try searching for something else
              </Text>
            </View>
          </View>
        )}
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    marginLeft: 12,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterButtonActive: {
    backgroundColor: "#0ea5e9",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
  },
  emptyState: {
    paddingHorizontal: 20,
  },
  recentSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 8,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    marginLeft: 12,
  },
  removeButton: {
    padding: 4,
  },
  suggestionsSection: {
    marginBottom: 32,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  searchResults: {
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  noResults: {
    alignItems: "center",
    paddingTop: 60,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 16,
  },
  noResultsText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },
});

export default SearchScreen;
