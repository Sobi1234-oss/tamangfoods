// screens/Order.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Header from '../../components/headers/Header';

const Order = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      navigation.navigate('Login');
      return;
    }

    const fetchUserRole = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        const role = userDoc.data()?.role || 'user';
        setUserRole(role);
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setUserRole('user');
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    if (!user || !userRole) return;

    const ref = firestore().collection('orders');
    const query = userRole === 'admin'
      ? ref.orderBy('createdAt', 'desc')
      : ref.where('customerId', '==', user.uid).orderBy('createdAt', 'desc');

    const unsubscribe = query.onSnapshot(
      snapshot => {
        const ordersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        setOrders(ordersList);
        setLoading(false);
      },
      error => {
        console.error('Error fetching orders: ', error);
        Alert.alert('Error', 'Failed to load orders');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userRole]);

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetails', { order });
  };

  const handleMarkCompleted = async (orderId) => {
    try {
      await firestore().collection('orders').doc(orderId).update({
        status: 'completed',
        deliveryTimeResponse: 'Your order will arrive in 30 minutes',
      });
      Alert.alert('Success', 'Order marked as completed.');
    } catch (error) {
      console.error('Error updating status: ', error);
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const handleDeleteOrder = (orderId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this completed order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('orders').doc(orderId).delete();
              Alert.alert('Deleted', 'Order has been deleted.');
            } catch (error) {
              console.error('Error deleting order:', error);
              Alert.alert('Error', 'Failed to delete order.');
            }
          },
        },
      ]
    );
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity style={styles.orderItem} onPress={() => handleOrderPress(item)}>
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
      <Text style={styles.orderDate}>{item.createdAt?.toLocaleString() || 'N/A'}</Text>
      <Text style={styles.orderTotal}>Rs {item.totalPrice?.toFixed(2) || '0.00'}</Text>

      {/* Admin: Mark Completed */}
      {userRole === 'admin' && item.status !== 'completed' && (
        <TouchableOpacity
          onPress={() => handleMarkCompleted(item.id)}
          style={styles.acceptButton}
        >
          <Text style={styles.acceptText}>Mark as Completed</Text>
        </TouchableOpacity>
      )}

      {/* Delete Button: Only if completed */}
      {item.status === 'completed' && (
        <TouchableOpacity
          onPress={() => handleDeleteOrder(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>Delete Order</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Orders" showBack={true} onBackPress={() => navigation.navigate('MainApp', { screen: 'Homescreen' })} />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}><Text>Loading orders...</Text></View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}><Text style={styles.emptyText}>No orders found</Text></View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666' },
  listContainer: { paddingBottom: 20, paddingTop: 8 },
  orderItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderId: { fontWeight: 'bold', fontSize: 14 },
  orderStatus: {
    fontWeight: 'bold', fontSize: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  statusPending: { backgroundColor: '#FFF3CD', color: '#856404' },
  statusPreparing: { backgroundColor: '#CCE5FF', color: '#004085' },
  statusCompleted: { backgroundColor: '#D4EDDA', color: '#155724' },
  statusRejected: { backgroundColor: '#F8D7DA', color: '#721C24' },
  orderCustomer: { color: '#555', marginBottom: 4 },
  orderDate: { color: '#777', fontSize: 12, marginBottom: 4 },
  orderTotal: { fontWeight: 'bold', color: '#2e7d32' },

  acceptButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  acceptText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: '#E53935',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default Order;
