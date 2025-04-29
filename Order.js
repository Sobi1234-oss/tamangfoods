import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Order= ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth().currentUser;

  // Fetch orders for the owner's restaurant
  useEffect(() => {
    if (!user) {
      Alert.alert('Error', 'Owner not logged in');
      navigation.navigate('Login');
      return;
    }

    // Assume the owner's restaurant ID is stored in Firestore under `users/{uid}/restaurantId`
    const fetchRestaurantId = async () => {
      try {
        const ownerDoc = await firestore().collection('users').doc(user.uid).get();
        const restaurantId = ownerDoc.data()?.restaurantId;

        if (!restaurantId) {
          Alert.alert('Error', 'No restaurant linked to this account');
          return;
        }

        // Listen for orders with matching restaurantId
        const unsubscribe = firestore()
          .collection('orders')
          .where('restaurantId', '==', restaurantId)
          .orderBy('createdAt', 'desc')
          .onSnapshot(snapshot => {
            const ordersList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));
            setOrders(ordersList);
            setLoading(false);
          });

        return () => unsubscribe();
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchRestaurantId();
  }, [user]);

  // Navigate to Order Details
  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetails', { order });
  };

  // Render each order item
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.substring(0, 6)}</Text>
        <Text style={[
          styles.orderStatus,
          item.status === 'pending' && styles.statusPending,
          item.status === 'preparing' && styles.statusPreparing,
          item.status === 'completed' && styles.statusCompleted,
          item.status === 'rejected' && styles.statusRejected,
        ]}>
          {item.status?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.orderCustomer}>{item.customerName || 'Unknown Customer'}</Text>
      <Text style={styles.orderDate}>
        {item.createdAt?.toLocaleString() || 'N/A'}
      </Text>
      <Text style={styles.orderTotal}>Rs {item.totalPrice?.toFixed(2) || '0.00'}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Restaurant Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  orderId: {
    fontWeight: 'bold',
  },
  orderStatus: {
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  statusPreparing: {
    backgroundColor: '#CCE5FF',
    color: '#004085',
  },
  statusCompleted: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  statusRejected: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  orderCustomer: {
    color: '#555',
    marginBottom: 5,
  },
  orderDate: {
    color: '#777',
    fontSize: 12,
    marginBottom: 5,
  },
  orderTotal: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});

export default Order;