import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Header from '../../components/headers/Header';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          setUserRole(userDoc.data()?.role || 'customer');
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole('customer'); // Default to customer if error occurs
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole === null) return;

    const user = auth().currentUser;
    if (!user) return;

    let query = firestore()
      .collection('notifications')
      .orderBy('createdAt', 'desc');

    // Customers only see their own notifications
    if (userRole === 'customer') {
      query = query.where('customerId', '==', user.uid);
    }

    const unsubscribe = query.onSnapshot(
      (snapshot) => {
        try {
          if (snapshot && !snapshot.empty) {
            const notificationsList = [];
            snapshot.forEach((doc) => {
              if (doc.exists) {
                notificationsList.push({
                  id: doc.id,
                  ...doc.data(),
                });
              }
            });
            setNotifications(notificationsList);
          } else {
            setNotifications([]); // Set empty array if no notifications
          }
          setLoading(false);
        } catch (error) {
          console.error("Error processing notifications:", error);
          setNotifications([]);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Notification listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userRole]);

  const getNotificationMessage = (notification) => {
    if (userRole === 'admin') {
      return `New order from ${notification.customerName}`;
    }

    switch (notification.type) {
      case 'status_update':
        return `Your order #${notification.orderId.substring(0, 6)} has been ${notification.status}`;
      case 'delivery_update':
        return `Your order is ${notification.deliveryStatus}`;
      default:
        return notification.message || 'You have a new notification';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Notifications"
          showBack={true}
          onBackPress={() => navigation.navigate('MainApp', { screen: 'Homescreen' })}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6D42" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Notifications"
        showBack={true}
        onBackPress={() => navigation.navigate('MainApp', { screen: 'Homescreen' })}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            scrollEnabled={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.notificationCard,
                  !item.read && styles.unreadNotification
                ]}
                onPress={() => {
                  // Mark as read when pressed
                  firestore().collection('notifications').doc(item.id).update({ read: true });
                  if (item.orderId) {
                    navigation.navigate('UserTabs', {
                      screen: 'Orders',
                      params: {
                       
                        params: { orderId: item.orderId }
                      }
                    });
                  }
                }}
              >
                <Text style={styles.notificationText}>
                  {getNotificationMessage(item)}
                </Text>
                <Text style={styles.notificationTime}>
                  {item.createdAt?.toDate().toLocaleString() || 'Just now'}
                </Text>
                {item.status && (
                  <Text style={[
                    styles.status,
                    item.status === 'pending' && styles.statusPending,
                    item.status === 'completed' && styles.statusCompleted,
                    item.status === 'cancelled' && styles.statusCancelled,
                    item.status === 'delivered' && styles.statusDelivered
                  ]}>
                    {item.status.toUpperCase()}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#31cac0',
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
    borderLeftColor: '#FF6D42',
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    color: '#FFA500',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
    color: '#F44336',
  },
  statusDelivered: {
    backgroundColor: '#E3F2FD',
    color: '#2196F3',
  },
});

export default NotificationsScreen;