import React, { useState, useEffect } from "react";
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, Alert, 
  ActivityIndicator, ScrollView 
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons';

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

  const addToCart = async () => {
    if (!userId) {
      Alert.alert("Login Required", "Please login to add items to cart", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") }
      ]);
      return;
    }

    setLoading(true);
    try {
      const cartRef = firestore()
        .collection('users')
        .doc(userId)
        .collection('cart')
        .doc(product.id);

      const cartItem = {
        productId: product.id,
        name: product.name,
        description: product.description || "",
        price: product.discountPrice || product.price,
        originalPrice: product.price,
        imageBase64: product.imageBase64 || "",
        quantity,
        restaurantId: product.restaurantId,
        restaurantName: product.restaurantName || "",
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      const docSnapshot = await cartRef.get();

      if (docSnapshot.exists) {
        await cartRef.update({
          quantity: firestore.FieldValue.increment(quantity),
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      } else {
        await cartRef.set(cartItem);
      }

      Alert.alert("Success", `${product.name} added to cart!`, [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => navigation.navigate("Cart", { userId }) }
      ]);
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => quantity > 1 && setQuantity(prev => prev - 1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Cart", { userId })}>
          <Icon name="shopping-cart" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{product.name}</Text>

      <Image
        source={{ uri: `data:image/jpeg;base64,${product.imageBase64}` }}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.description}>{product.description || "No description available"}</Text>
      <Text style={styles.restaurantName}>Restaurant: {product.restaurantName}</Text>

      <View style={styles.priceContainer}>
        {product.discountPrice ? (
          <>
            <Text style={styles.originalPrice}>Rs {product.price}</Text>
            <Text style={styles.discountPrice}>Rs {product.discountPrice}</Text>
          </>
        ) : (
          <Text style={styles.price}>Rs {product.price}</Text>
        )}
      </View>

      {!isOwner && (
        <>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={decrementQuantity} style={styles.quantityButton}>
              <Icon name="remove" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity onPress={incrementQuantity} style={styles.quantityButton}>
              <Icon name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={addToCart}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addToCartText}>Add to Cart</Text>}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  image: { width: '100%', height: 250, borderRadius: 10, marginBottom: 15 },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 15 },
  restaurantName: { fontSize: 18, color: '#444', fontWeight: 'bold', marginBottom: 10 },
  priceContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  originalPrice: { fontSize: 18, color: '#999', textDecorationLine: 'line-through', marginRight: 10 },
  discountPrice: { fontSize: 22, color: '#D32F2F', fontWeight: 'bold' },
  price: { fontSize: 22, color: '#333', fontWeight: 'bold' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  quantityButton: { backgroundColor: '#eee', padding: 10, borderRadius: 20 },
  quantityText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 10 },
  addToCartButton: { backgroundColor: 'orange', padding: 15, borderRadius: 8, alignItems: 'center' },
  addToCartText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default ProductDetails;
