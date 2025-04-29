import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

const upperTabs = ["Used Cars", "New Cars", "Bikes", "Auto Store"]; // Tabs inside the header
const categories = ["Category", "Brand", "Budget", "Model"]; // Tabs below "Browse Used Cars"
const products = {
  Category: [
    { name: "Automatic Cars", icon: "car", color: "#888" }, // Light gray
    { name: "Family Cars", icon: "users", color: "#888" }, // Light gray
    { name: "5 Seater", icon: "chair", color: "#888" }, // Light gray
    { name: "Small Cars", icon: "car", color: "#888" }, // Light gray
    { name: "Big Cars", icon: "truck", color: "#888" }, // Light gray
    { name: "Imported Cars", icon: "ship", color: "#888" }, // Light gray
    { name: "Old Cars", icon: "history", color: "#888" }, // Light gray
    { name: "5 Door", icon: "door-open", color: "#888" }, // Light gray
  ],
  Budget: [
    { name: "Under 10 Lakh", icon: "money", color: "#888" }, // Light gray
    { name: "10-20 Lakh", icon: "money", color: "#888" }, // Light gray
    { name: "20-30 Lakh", icon: "money", color: "#888" }, // Light gray
    { name: "Above 30 Lakh", icon: "money", color: "#888" }, // Light gray
    { name: "Flexible Budget", icon: "money", color: "#888" }, // Light gray
    { name: "Fixed Budget", icon: "money", color: "#888" }, // Light gray
    { name: "Lease Options", icon: "money", color: "#888" }, // Light gray
    { name: "EMI Plans", icon: "money", color: "#888" }, // Light gray
  ],
  Brand: [
    { name: "Toyota", icon: "car", color: "#888" }, // Light gray
    { name: "Honda", icon: "car", color: "#888" }, // Light gray
    { name: "Suzuki", icon: "car", color: "#888" }, // Light gray
    { name: "Kia", icon: "car", color: "#888" }, // Light gray
    { name: "Hyundai", icon: "car", color: "#888" }, // Light gray
    { name: "BMW", icon: "car", color: "#888" }, // Light gray
    { name: "Audi", icon: "car", color: "#888" }, // Light gray
    { name: "Mercedes", icon: "car", color: "#888" }, // Light gray
  ],
  Model: [
    { name: "Civic", icon: "car", color: "#888" }, // Light gray
    { name: "Corolla", icon: "car", color: "#888" }, // Light gray
    { name: "City", icon: "car", color: "#888" }, // Light gray
    { name: "Sportage", icon: "car", color: "#888" }, // Light gray
    { name: "Accord", icon: "car", color: "#888" }, // Light gray
    { name: "Camry", icon: "car", color: "#888" }, // Light gray
    { name: "Sonata", icon: "car", color: "#888" }, // Light gray
    { name: "Elantra", icon: "car", color: "#888" }, // Light gray
  ],
};

const HomeScreen = () => {
  const [selectedUpperTab, setSelectedUpperTab] = useState(0); // Track active upper tab index
  const [selectedTab, setSelectedTab] = useState(0); // Track active tab index
  const swiperRef = useRef(null); // Ref for Swiper

  // Handle upper tab change
  const handleUpperTabChange = (index) => {
    setSelectedUpperTab(index);
  };

  // Handle tab change
  const handleTabChange = (index) => {
    setSelectedTab(index);
    swiperRef.current?.scrollTo(index); // Sync Swiper with tab change
  };

  // Handle Swiper index change
  const handleSwiperIndexChange = (index) => {
    setSelectedTab(index); // Sync tab with Swiper change
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Tabs and Search Bar */}
      <View style={styles.header}>
        {/* Upper Tabs */}
        <FlatList
          data={upperTabs}
          horizontal
          keyExtractor={(item) => item}
          contentContainerStyle={styles.upperTabContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.upperTab, selectedUpperTab === index && styles.selectedUpperTab]}
              onPress={() => handleUpperTabChange(index)}
            >
              <Text style={[styles.upperTabText, selectedUpperTab === index && styles.selectedUpperTabText]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888" style={styles.icon} />
          <TextInput style={styles.searchInput} placeholder="Search used cars" placeholderTextColor={'#888'} />
          <Text style={styles.separator}>|</Text>
          <Icon name="map-marker" size={20} color="#000" style={styles.icon} /> {/* Black location icon */}
          <Text style={styles.locationText}>Rawalpindi</Text>
        </View>
      </View>

      {/* Recent Searches */}
      <Text style={styles.sectionTitle}>Recent Searches</Text>
      <View style={styles.recentSearchContainer}>
        <TouchableOpacity style={styles.recentSearchItem}>
          <Text style={styles.recentSearchHeading}>All Cars</Text>
          <Text style={styles.recentSearchText}>All Cities, Any Price, Any Year</Text>
        </TouchableOpacity>
      </View>

      {/* Browse Used Cars */}
      <Text style={styles.sectionTitle}>Browse Used Cars</Text>

      {/* Tabs */}
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item}
        contentContainerStyle={styles.tabContainer}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.tab, selectedTab === index && styles.selectedTab]}
            onPress={() => handleTabChange(index)}
          >
            <Text style={[styles.tabText, selectedTab === index && styles.selectedTabText]}>{item}</Text>
            {selectedTab === index && <View style={styles.tabLine} />} {/* Line below active tab */}
          </TouchableOpacity>
        )}
      />

      {/* Swiper */}
      <Swiper
        ref={swiperRef}
        style={styles.swiper}
        showsPagination
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        onIndexChanged={handleSwiperIndexChange} // Sync tabs with Swiper
      >
        {categories.map((category, index) => (
          <View key={index} style={styles.slide}>
            {/* Products Grid */}
            <View style={styles.productGrid}>
              {products[category].map((item, index) => (
                <TouchableOpacity key={index} style={styles.productItem}>
                  <Icon name={item.icon} size={18} color="#000" style={styles.productIcon} /> {/* Thin icon */}
                  <Text style={styles.productText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </Swiper>

      {/* PakWheels Offerings */}
      <Text style={styles.sectionTitle}>PakWheels Offerings</Text>
      <View style={styles.offeringsContainer}>
        {["Home", "My Ads", "Sell Now", "Chat", "More"].map((item, index) => (
          <TouchableOpacity key={index} style={styles.offeringItem}>
            <Text style={styles.offeringText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};



// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginBottom: 50,
  },
  header: {
    backgroundColor: "#1E3A8A", // Navy blue
    padding: 10,
    height: 150,
  },
  upperTabContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginBottom: 10,
    justifyContent: "flex-start",
    top: 10,
    left: -3,
  },
  upperTab: {
    padding: 10,
    marginHorizontal: 3,
    backgroundColor: "white", // Light navy
    borderRadius: 20,
    height: 38,
    left: -10,
    justifyContent: "center",
  },
  selectedUpperTab: {
    backgroundColor: "#4682b4", // Darker blue for selected tab
  },
  upperTabText: {
    color: "royalblue",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
    paddingLeft: 20,
    paddingRight: 15,
  },
  selectedUpperTabText: {
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#000",
  },
  separator: {
    marginHorizontal: 10,
    color: "#888",
  },
  locationText: {
    marginLeft: 5,
    color: "#000", // Black text for location
  },
  icon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 15,
    color: "#000",
  },
  recentSearchContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    width: 220,
    height: 100,
  },
  recentSearchItem: {
    alignItems: "flex-start",
  },
  recentSearchHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  recentSearchText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginTop: 10,
    paddingLeft: 20,
  },
  tab: {
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectedTab: {
    borderBottomWidth: 2, // Line below active tab
    borderBottomColor: "royalblue",
  },
  tabText: {
    color: "black",
    fontWeight: "bold",
  },
  selectedTabText: {
    color: "royalblue",
  },
  tabLine: {
    // Empty for now
  },
  swiper: {
    height: 250,
    top: 0, // Adjusted height for Swiper
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    padding: 10,
  },
  productItem: {
    width: "23%", // 4 items per row
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
    height: 105, // Fixed height for product container
    borderWidth: 1, // Thin border
    borderColor: "#e0e0e0", // Light gray border
    elevation: 1, // Shadow for elevation
  },
  productIcon: {
    marginBottom: 5,
    color: "grey",
    alignItems: "center",
    top: 9, // Space between icon and text
  },
  productText: {
    fontSize: 12, // Smaller text
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
    top: 9,
  },
  dot: {
    backgroundColor: "#ccc",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
    top: 25,
  },
  activeDot: {
    backgroundColor: "royalblue",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
    top: 25,
  },
  offeringsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    top: 30,
  },
  offeringItem: {
    padding: 10,
    top: 20,
  },
  offeringText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    top: 30,
  },
});
export default HomeScreen;