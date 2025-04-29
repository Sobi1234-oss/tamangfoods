import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Image,
  ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';

const Cart = ({ navigation, route }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [restaurantOwners, setRestaurantOwners] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id || route.params?.userId || "");
    };
    fetchUserData();
  }, [route.params?.userId]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .collection('cart')
      .onSnapshot((snapshot) => {
        const items = [];
        let total = 0;
        const owners = {};
        
        snapshot.forEach(doc => {
          const item = doc.data();
          items.push({
            id: doc.id,
            ...item
          });
          total += (item.discountPrice || item.price) * item.quantity;
          
          // Store restaurant owner IDs
          if (item.restaurantId) {
            owners[item.restaurantId] = true;
          }
        });
        
        setCartItems(items);
        setTotalPrice(total);
        setRestaurantOwners(owners);
      }, (error) => {
        console.error("Error fetching cart items:", error);
        Alert.alert("Error", "Failed to load cart items");
      });

    return () => unsubscribe();
  }, [userId]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      setLoading(true);
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('cart')
        .doc(itemId)
        .update({
          quantity: newQuantity
        });
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('cart')
        .doc(itemId)
        .delete();
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const sendOrderNotification = async (restaurantId, orderId) => {
    try {
      // Get owner's FCM token
      const ownerDoc = await firestore()
        .collection('users')
        .doc(restaurantId)
        .get();
      
      const ownerToken = ownerDoc.data()?.fcmToken;
      if (!ownerToken) return;

      // Create notification in Firestore
      await firestore()
        .collection('notifications')
        .add({
          userId: restaurantId,
          title: 'New Order Received',
          message: `You have a new order #${orderId}`,
          orderId: orderId,
          read: false,
          createdAt: firestore.FieldValue.serverTimestamp()
        });

      // Send push notification
      const message = {
        notification: {
          title: 'New Order Received',
          body: `You have a new order #${orderId}`
        },
        token: ownerToken,
        data: {
          orderId: orderId,
          type: 'new_order'
        }
      };

      await messaging().sendMessage(message);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const proceedToCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      
      // Create order document
      const orderRef = await firestore()
        .collection('orders')
        .add({
          userId: userId,
          items: cartItems,
          total: totalPrice + 50, // Including delivery fee
          status: 'pending',
          createdAt: firestore.FieldValue.serverTimestamp(),
          deliveryAddress: '', // You should get this from user profile
          paymentMethod: '', // You should get this from checkout
          restaurantIds: Object.keys(restaurantOwners)
        });

      // Send notifications to all restaurant owners
      const ownerIds = Object.keys(restaurantOwners);
      for (const ownerId of ownerIds) {
        await sendOrderNotification(ownerId, orderRef.id);
      }

      // Clear the cart
      const batch = firestore().batch();
      cartItems.forEach(item => {
        const ref = firestore()
          .collection('users')
          .doc(userId)
          .collection('cart')
          .doc(item.id);
        batch.delete(ref);
      });
      await batch.commit();

      // Navigate to order confirmation
      navigation.navigate('OrderConfirmation', { 
        orderId: orderRef.id 
      });
      
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to complete checkout');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image
        source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemRestaurant}>{item.restaurantName}</Text>
        <Text style={styles.itemPrice}>
          Rs {(item.discountPrice || item.price).toFixed(2)}
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            style={styles.quantityButton}
            disabled={loading}
          >
            <Icon name="remove" size={18} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            style={styles.quantityButton}
            disabled={loading}
          >
            <Icon name="add" size={18} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        onPress={() => removeItem(item.id)}
        style={styles.deleteButton}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#F44336" />
        ) : (
          <Icon name="delete" size={24} color="#F44336" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="remove-shopping-cart" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.continueShoppingButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>Rs {totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>Rs 50.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>Total</Text>
              <Text style={styles.summaryTotal}>Rs {(totalPrice + 50).toFixed(2)}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={proceedToCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',marginBottom:50
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 20,
  },
  continueShoppingButton: {
    backgroundColor: 'orange',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  continueShoppingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  itemRestaurant: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemPrice: {
    color: '#2e7d32',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
  },
  deleteButton: {
    padding: 10,
  },
  summaryContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: 'orange',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Cart;