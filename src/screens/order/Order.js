// screens/Order.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Header from '../../components/headers/Header';
import { sendOrderNotification } from '../../Services/notificationService';

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

 const handleMarkCompleted = async (orderId, order) => {
  try {
    // Fetch an admin user's location (assumes admin document contains `location`)
    const adminSnapshot = await firestore().collection('users').where('role', '==', 'admin').limit(1).get();
    let adminLocation = null;
    if (!adminSnapshot.empty) {
      const adminDoc = adminSnapshot.docs[0];
      adminLocation = adminDoc.data()?.location || null;
    }

    // If adminLocation is not set in Firestore, use the provided default admin coordinates
    // Provided admin coordinates: 33.65278267381303, 73.06628055562464
    if (!adminLocation) {
      adminLocation = { latitude: 33.65278267381303, longitude: 73.06628055562464 };
    }

    // Helper: parse location formats into { latitude, longitude }
    const parseLocation = (loc) => {
      if (!loc) { return null; }
      if (typeof loc === 'object' && loc.latitude != null && loc.longitude != null) {
        return { latitude: Number(loc.latitude), longitude: Number(loc.longitude) };
      }
      if (typeof loc === 'string') {
        // Try comma-separated "lat,lng"
        const csvMatch = loc.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
        if (csvMatch) {
          return { latitude: Number(csvMatch[1]), longitude: Number(csvMatch[2]) };
        }
        // Try "Lat: x, Lng: y" or similar
        const nums = loc.match(/-?\d+\.?\d*/g);
        if (nums && nums.length >= 2) {
          return { latitude: Number(nums[0]), longitude: Number(nums[1]) };
        }
      }
      return null;
    };

    const adminCoords = parseLocation(adminLocation);
    const orderCoords = parseLocation(order.locationCoords || order.location);

    if (!orderCoords) {
      Alert.alert('ETA Notice', 'Order location does not contain coordinates; using default ETA (30 minutes). Ask customer to use "Use My Current Location" for accurate ETA.');
    }

    // Haversine distance (km)
    const haversineKm = (a, b) => {
      const toRad = v => (v * Math.PI) / 180;
      const R = 6371; // Earth's radius in km
      const dLat = toRad(b.latitude - a.latitude);
      const dLon = toRad(b.longitude - a.longitude);
      const lat1 = toRad(a.latitude);
      const lat2 = toRad(b.latitude);
      const sinDLat = Math.sin(dLat / 2);
      const sinDLon = Math.sin(dLon / 2);
      const aa = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
      return R * c;
    };

    // Estimate delivery time in minutes using average speed (km/h)
    let etaMinutes = null;
    if (adminCoords && orderCoords) {
      try {
        const distanceKm = haversineKm(adminCoords, orderCoords);
        const avgSpeedKmh = 25; // reasonable city average (25 km/h). Tune as needed.
        const minutes = (distanceKm / avgSpeedKmh) * 60;
        // Round to nearest 5 minutes and enforce min 10 minutes
        const rounded = Math.max(10, Math.round(minutes / 5) * 5);
        etaMinutes = rounded;
        console.log('[ETA] distanceKm=', distanceKm, 'minutes(raw)=', minutes, 'etaMinutes=', etaMinutes);
      } catch (err) {
        console.warn('ETA calculation failed, using fallback', err);
      }
    } else {
      if (!adminCoords) {
        console.log('[ETA] adminCoords missing, adminCoords=', adminCoords);
      }
      if (!orderCoords) {
        console.log('[ETA] orderCoords missing or unparsable, order.location=', order.location);
      }
    }

    // Fallback default ETA
    if (!etaMinutes) { etaMinutes = 30; }


    const deliveryTimeText = `Estimated delivery time: approx ${etaMinutes} minutes`;

    // Update order status to 'completed' and set deliveryTimeResponse with ETA
    await firestore().collection('orders').doc(orderId).update({
      status: 'completed',
      deliveryTimeResponse: deliveryTimeText,
    });

    // Send notification to customer containing ETA
    const productNames = order.items?.map(item => item.name).join(', ') || 'your items';
    await sendOrderNotification({
      customerId: order.customerId,
      orderId: orderId,
      type: 'status_update',
      status: 'completed',
      productName: productNames,
      message: `Your ${productNames} order has been prepared. ${deliveryTimeText}. Delivered!`,
      read: false,
    });

    Alert.alert('Success', `Order marked complete. ${deliveryTimeText}. Customer notified.`);
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

      {item.deliveryTimeResponse ? (
        <Text style={styles.deliveryEta}>{item.deliveryTimeResponse}</Text>
      ) : null}

      {/* Admin: Mark Completed */}
       
    {userRole === 'admin' && item.status !== 'completed' && (
      <TouchableOpacity
        onPress={() => handleMarkCompleted(item.id, item)}
        style={styles.acceptButton}
      >
        <Text style={styles.acceptText}>Mark Complete & Show Time</Text>
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
            contentContainerStyle={[styles.listContainer, { marginBottom: 50 }]}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff',marginBottom:20 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8,marginBottom:70 },
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

  deliveryEta: { color: '#FF6D42', marginTop: 6, fontSize: 13, fontWeight: '600' },

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
