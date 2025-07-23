import React, { useState, useEffect } from "react";
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, Alert, 
  ActivityIndicator, ScrollView, StatusBar, Dimensions 
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Header from "../../components/headers/Header";
import useCartStore from "../../components/store/CartStore"; // Import the store
const { width } = Dimensions.get('window');

const ProductDetails = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);

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
  }, []);

   const addToCart = useCartStore(state => state.addToCart);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Add product to cart with current quantity
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
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

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => quantity > 1 && setQuantity(prev => prev - 1);

  return (
    <View style={styles.container}>
      <Header title="Product details" showBack={true}/>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${product.imageBase64}` }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
          <Text style={styles.price}>Rs {product.price}</Text>
        </View>

          <View style={styles.restaurantContainer}>
            <Icon name="restaurant" size={18} color="#FF6B6B" />
            <Text style={styles.restaurantName}>{product.restaurantName}</Text>
          </View>

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
                >
                  <Icon name="remove" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity 
                  onPress={incrementQuantity} 
                  style={styles.quantityButton}
                >
                  <Icon name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {!isOwner && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="add-shopping-cart" size={20} color="#fff" style={styles.cartIcon} />
                <Text style={styles.addToCartText}>ADD TO CART - Rs {(product.discountPrice || product.price) * quantity}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 80, // Space for fixed footer
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cartIconContainer: {
    position: 'relative',
  },
  imageContainer: {
    height: width * 0.8,
    width: '95%',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    top:10,borderWidth:1,borderColor:'crimson',
    left:8
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    fontFamily:'Quicksand-Bold'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
   
    marginRight: 10,
  },
  
  price: {
    fontSize: 24,
    color: 'black',
    fontFamily:'Quicksand-Medium'
  },
  discountBadge: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#FF6B6B',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  discountBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  restaurantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  restaurantName: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  quantityLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#FF6B6B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 5,
  },
  addToCartButton: {
    backgroundColor: '#ff4500',
    padding: 18,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cartIcon: {
    marginRight: 5,
  },
});

export default ProductDetails;