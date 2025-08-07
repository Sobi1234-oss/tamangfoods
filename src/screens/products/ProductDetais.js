import React, { useState, useEffect } from "react";
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, StatusBar, Dimensions, Animated, Easing
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Header from "../../components/headers/Header";
import useCartStore from "../../components/store/CartStore";

const { width, height } = Dimensions.get('window');

const ProductDetails = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const scaleValue = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        const role = await AsyncStorage.getItem('userRole');
        setUserId(id || "");
        setUserRole(role || "");
        setIsOwner(role === 'restaurant_owner' && id === product.ownerId);
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data");
      }
    };
    fetchUserData();

    // Animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const addToCart = useCartStore(state => state.addToCart);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Pulse animation when adding to cart
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageBase64: product.imageBase64,
        restaurantId: product.restaurantId,
        restaurantName: product.restaurantName
      }, quantity);

      Alert.alert(
        "Added to Cart",
        `${product.name} (${quantity}x) has been added to your cart`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => navigation.navigate("UserTabs", { screen: "Cart" }) }
        ]
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = () => {
    Animated.timing(scaleValue, {
      toValue: 1.05,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setQuantity(prev => prev + 1);
      scaleValue.setValue(1);
    });
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        setQuantity(prev => prev - 1);
        scaleValue.setValue(1);
      });
    }
  };

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
    opacity: fadeAnim,
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ff4500" barStyle="light-content" />
      <Header title="Product Details" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${product.imageBase64}` }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>

        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          <Text style={styles.title}>{product.name}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>Rs {product.price}</Text>
          </View>

          <View style={styles.restaurantContainer}>
            <Icon name="restaurant" size={20} color="#ff4500" />
            <Text style={styles.restaurantName}>{product.restaurantName}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || "No description available for this product."}
          </Text>

          {!isOwner && (
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  onPress={decrementQuantity}
                  style={styles.quantityButton}
                  activeOpacity={0.7}
                >
                  <Icon name="remove" size={24} color="#fff" />
                </TouchableOpacity>
                <Animated.Text style={[styles.quantityText, animatedStyle]}>
                  {quantity}
                </Animated.Text>
                <TouchableOpacity
                  onPress={incrementQuantity}
                  style={styles.quantityButton}
                  activeOpacity={0.7}
                >
                  <Icon name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {!isOwner && (
        <Animated.View style={[styles.footer, animatedStyle]}>
          <LinearGradient
            colors={['#ff4500', '#ff8c00']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="add-shopping-cart" size={22} color="#fff" style={styles.cartIcon} />
                  <Text style={styles.addToCartText}>
                    ADD TO CART - Rs {product.price * quantity}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    height: width * 0.8,
    width: width - 20,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Quicksand-Bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  price: {
    fontSize: 26,
    color: '#ff4500',
    fontWeight: '700',
    fontFamily: 'Quicksand-Bold',
  },
  restaurantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
  },
  restaurantName: {
    fontSize: 18,
    color: '#555',
    marginLeft: 10,
    fontWeight: '600',
    fontFamily: 'Quicksand-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Quicksand-Bold',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'Quicksand-Medium',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  quantityLabel: {
    fontSize: 17,
    color: '#555',
    fontWeight: '600',
    fontFamily: 'Quicksand-SemiBold',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#ff4500',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#ff4500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'transparent',
  },
  gradientButton: {
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#ff4500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addToCartButton: {
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Quicksand-Bold',
  },
  cartIcon: {
    marginRight: 8,
  },
});

export default ProductDetails;