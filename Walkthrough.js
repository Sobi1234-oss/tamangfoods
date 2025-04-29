import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, FlatList } from 'react-native';

const { width } = Dimensions.get('window');
const circleSize = 300;
const slides = [
  { 
    image: require('./images/slide2.png'), 
    text: "All your favorites\nOrder from the best local restaurants with easy, on-demand delivery.",
    imageWidth: 250, // Custom width for image 1
    imageHeight: 250, // Custom height for image 1
  },
  { 
    image: require('./images/slide1.png'), 
    text: "Free delivery offers\nFree delivery for new customers via Apple Pay and other payment methods.",
    imageWidth: 280, // Custom width for image 2
    imageHeight: 220,  // Custom height for image 2
  },
  { 
    image: require('./images/slide3.png'), 
    text: "Exclusive discounts\nGet exclusive discounts and offers on your first order.",
    imageWidth: 260, // Custom width for image 3
    imageHeight: 260, 
  // Custom height for image 3
  },
];

const Walkthrough = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('./images/g12.png')} style={styles.logo} />
        <Text style={styles.heading}>
          {"   "} Tamang{"\n"}Food Service
        </Text>
      </View>
      <View style={styles.circleContainer}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.imageWrapper}>
              <Image 
                source={item.image} 
                style={[
                  styles.image,
                  { width: item.imageWidth, height: item.imageHeight } // Dynamic width and height
                ]} 
              />
              <Text style={styles.description}>
                <Text style={styles.headingText}>{item.text.split('\n')[0]}</Text>
                {"\n"}
                {item.text.split('\n')[1]}
              </Text>
            </View>
          )}
        />
      </View>
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.paginationDot, activeIndex === index && styles.paginationDotActive]}
          />
        ))}
      </View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Login')} // Navigate to Login screen
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 30,
    left: 50,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
    resizeMode: 'contain',
  },
  heading: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 10,
    paddingBottom: 10,
  },
  circleContainer: {
    width: circleSize,
    height: 360,
    overflow: 'hidden',
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    shadowColor: 'blue',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    borderWidth: 0,borderColor: 'white',
  },
  imageWrapper: {
    width: circleSize,
    height: circleSize,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  image: {
    resizeMode: 'contain',
    borderRadius: circleSize / 2,   position: 'absolute',
    marginTop: -100,
  },
  description: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginHorizontal: 40,
    marginTop: 320,
    lineHeight: 24,
    position: 'absolute',
  },
  headingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  button: {
    backgroundColor: 'orange',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 10,
    position: 'absolute',
    bottom: 50,
    width: 335,
    height: 48,
  }, button1: {
    backgroundColor: 'orange',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 10,
    position: 'relative',
    bottom: 50,
    width: 335,
    height: 48,top:-50
  }, button2: {
    backgroundColor: 'orange',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 10,
    position: 'absolute',
    bottom: 50,
    width: 335,
    height: 48,top :50
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: 'orange',
  },
});

export default Walkthrough;