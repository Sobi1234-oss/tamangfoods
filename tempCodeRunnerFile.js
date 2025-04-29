import React, { useState, useRef } from 'react';
import { View, Text, FlatList, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const SLIDER_HEIGHT = 220;
const ITEM_WIDTH = width - 40;

// Sample Data (same as before)

const HomeScreen = ({ route, navigation }) => {
  const selectedLocation = route.params?.selectedLocation || 'Current Location';
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef(null);

  const updateActiveSlide = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / ITEM_WIDTH);
    setActiveSlide(currentIndex);
  };

  const renderSliderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {sliderImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeSlide === index && styles.activeDot
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Location Header (same as before) */}

      {/* Enhanced Slider Section */}
      <View style={styles.sliderWrapper}>
        <FlatList
          ref={sliderRef}
          data={sliderImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={updateActiveSlide}
          renderItem={({ item }) => (
            <View style={{ width: ITEM_WIDTH }}>
              <Image source={item} style={styles.sliderImage} resizeMode="cover" />
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
        {renderSliderDots()}
      </View>

      {/* Categories Section (same as before) */}

      {/* Featured Products Section (same as before) */}

      {/* All Products Section with See All */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Products</Text>
          <TouchableOpacity onPress={() => console.log('See All Products')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={allProducts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={[styles.productCard, { width: (width - 40) / 3 - 10 }]}>
              <Image source={item.image} style={styles.productImage} resizeMode="contain" />
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDiscount}>{item.discount}</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... previous styles remain same
  
  sliderWrapper: {
    height: SLIDER_HEIGHT,
    marginVertical: 15,
    position: 'relative',
  },
  sliderImage: {
    width: ITEM_WIDTH,
    height: SLIDER_HEIGHT,
    borderRadius: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: 'orange',
    width: 20,
  },
  productCard: {
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 10,
    alignItems: 'center',
    elevation: 5,
  },
  productImage: {
    width: 80,
    height: 80,
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  productDiscount: {
    fontSize: 11,
    color: 'orange',
    fontWeight: 'bold',
    marginTop: 3,
  },
});

export default HomeScreen;