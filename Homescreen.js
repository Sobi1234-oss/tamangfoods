import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
  TextInput,
  ScrollView,
  Animated,
  Alert
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

const { width, height } = Dimensions.get('window');

const Homescreen = () => {
  const navigation = useNavigation();
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sliderInterval = useRef(null);

  const sliderImages = [
    { id: 1, image: require('./assets/slider1.png') },
    { id: 2, image: require('./assets/slider2.png') },
    { id: 3, image: require('./assets/slider3.png') },
  ];

  const bannerImage = require('./images/Banner.png');

  useEffect(() => {
    const fetchUserData = async () => {
      const role = await AsyncStorage.getItem('userRole');
      const name = await AsyncStorage.getItem('userName');
      const userId = await AsyncStorage.getItem('userId');
      setUserRole(role);
      setUserName(name || 'User');

      if (role === 'restaurant_owner') {
        await setupPushNotifications(userId);
      }
    };
    fetchUserData();
  }, []);

  const setupPushNotifications = async (userId) => {
    try {
      await messaging().requestPermission();
      const token = await messaging().getToken();
      await firestore().collection('users').doc(userId).update({ fcmToken: token });

      const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert(
          remoteMessage.notification?.title || 'New Order',
          remoteMessage.notification?.body || 'You have a new order',
          [
            {
              text: 'View',
              onPress: () => navigation.navigate('OwnerOrders')
            },
            { text: 'OK' }
          ]
        );
      });

      return unsubscribe;
    } catch (error) {
      console.error('Push notification setup error:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesSnapshot, restaurantsSnapshot] = await Promise.all([
          firestore().collection('categories').get(),
          firestore().collection('restaurants').orderBy('createdAt', 'desc').get()
        ]);

        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const restaurantList = restaurantsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          imageBase64: doc.data().imageBase64 || '',
        }));

        setCategories(categoriesList);
        setRestaurants(restaurantList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId && userRole === 'restaurant_owner') {
        const unsubscribe = firestore()
          .collection('notifications')
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .onSnapshot(snapshot => {
            const notificationsList = [];
            snapshot.forEach(doc => {
              notificationsList.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
              });
            });
            setNotifications(notificationsList);
            setUnreadNotifications(notificationsList.filter(n => !n.read).length);
          });
        return unsubscribe;
      }
    };
    fetchNotifications();
  }, [userRole]);

  useEffect(() => {
    if (sliderImages.length > 1) {
      sliderInterval.current = setInterval(() => {
        setActiveSlide(prev => {
          const nextSlide = prev === sliderImages.length - 1 ? 0 : prev + 1;
          flatListRef.current?.scrollToIndex({
            index: nextSlide,
            animated: true
          });
          return nextSlide;
        });
      }, 5000);
    }

    return () => {
      if (sliderInterval.current) {
        clearInterval(sliderInterval.current);
      }
    };
  }, [sliderImages.length]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const markNotificationsAsRead = async () => {
    const batch = firestore().batch();
    notifications
      .filter(n => !n.read)
      .forEach(notification => {
        const ref = firestore().collection('notifications').doc(notification.id);
        batch.update(ref, { read: true });
      });
    await batch.commit();
    setUnreadNotifications(0);
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const categoryMatch = !selectedCategory || restaurant.categoryId === selectedCategory;
    const searchMatch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const topRatedRestaurants = [...restaurants]
    .filter(restaurant => restaurant.rating >= 4.7)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('Resturantdetails', { restaurant: item })}
    >
      <Image
        source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
        style={styles.restaurantImage}
        resizeMode="cover"
      />
      <View style={styles.restaurantDetails}>
        <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.iconTextContainer}>
          <Icon name="location-on" size={14} color="#4CAF50" />
          <Text style={styles.restaurantLocation} numberOfLines={1}>
            {item.location.split(',')[0]}
          </Text>
        </View>
        <View style={styles.iconTextContainer}>
          <Icon name="star" size={14} color="#FFA000" />
          <Text style={styles.restaurantRating}>{item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTopRatedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.topRatedCard}
      onPress={() => navigation.navigate('Resturantdetails', { restaurant: item })}
    >
      <Image
        source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
        style={styles.topRatedImage}
        resizeMode="cover"
      />
      <View style={styles.topRatedDetails}>
        <Text style={styles.topRatedName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.iconTextContainer}>
          <Icon name="star" size={14} color="#FFA000" />
          <Text style={styles.topRatedRating}>{item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotificationItem
      ]}
      onPress={() => {
        navigation.navigate('Order');
        setNotificationModalVisible(false);
      }}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeaderRow}>
          <Text style={styles.notificationTitle}>{item.title || 'New Order'}</Text>
          {!item.read && <View style={styles.unreadIndicator} />}
        </View>
        <Text style={styles.notificationBody}>{item.message || 'You have a new order'}</Text>
        <Text style={styles.notificationTime}>
          {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {' • '}
          {item.createdAt.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color="#999" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.profileButton}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileInitial}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Tamang Foods</Text>
        
        {userRole === 'restaurant_owner' && (
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {
              setNotificationModalVisible(true);
              markNotificationsAsRead();
            }}
          >
            <Icon name="notifications" size={24} color="#4682B4" />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Sidebar Menu */}
      <Modal
        visible={sidebarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleSidebar}
      >
        <TouchableOpacity 
          style={styles.sidebarOverlay} 
          activeOpacity={1}
          onPress={toggleSidebar}
        >
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <View style={[styles.profileIcon, styles.sidebarProfileIcon]}>
                <Text style={styles.profileInitial}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>
                {userRole === 'restaurant_owner' ? 'Restaurant Owner' : 'Customer'}
              </Text>
            </View>

            <ScrollView style={styles.menu}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {
                  toggleSidebar();
                  navigation.navigate('Homescreen');
                }}
              >
                <Icon name="home" size={24} color="#4682B4" />
                <Text style={styles.menuText}>Home</Text>
              </TouchableOpacity>

              {userRole === 'restaurant_owner' && (
                <>
                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => {
                      toggleSidebar();
                      navigation.navigate('AddRestaurant');
                    }}
                  >
                    <Icon name="add-business" size={24} color="#4682B4" />
                    <Text style={styles.menuText}>Add Restaurant</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => {
                      toggleSidebar();
                      navigation.navigate('OwnerOrders');
                    }}
                  >
                    <Icon name="list-alt" size={24} color="#4682B4" />
                    <Text style={styles.menuText}>My Orders</Text>
                    {unreadNotifications > 0 && (
                      <View style={styles.sidebarNotificationBadge}>
                        <Text style={styles.sidebarNotificationBadgeText}>
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {
                  toggleSidebar();
                  navigation.navigate('Cart');
                }}
              >
                <Icon name="shopping-cart" size={24} color="#4682B4" />
                <Text style={styles.menuText}>My Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {
                  toggleSidebar();
                  navigation.navigate('Profile');
                }}
              >
                <Icon name="person" size={24} color="#4682B4" />
                <Text style={styles.menuText}>My Profile</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Icon name="logout" size={24} color="#FF6B6B" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notification Modal */}
      <Modal
        visible={notificationModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <SafeAreaView style={styles.notificationModal}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationHeaderText}>Order Notifications</Text>
            <TouchableOpacity onPress={() => setNotificationModalVisible(false)}>
              <Icon name="close" size={24} color="#4682B4" />
            </TouchableOpacity>
          </View>
          
          {notifications.length === 0 ? (
            <View style={styles.emptyNotificationContainer}>
              <Icon name="notifications-off" size={50} color="#ccc" />
              <Text style={styles.noNotificationsText}>No new orders</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.notificationList}
              ListHeaderComponent={
                <TouchableOpacity
                  style={styles.markAllReadButton}
                  onPress={markNotificationsAsRead}
                  disabled={unreadNotifications === 0}
                >
                  <Text style={styles.markAllReadText}>Mark all as read</Text>
                </TouchableOpacity>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Main Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Slider */}
        <View style={styles.sliderContainer}>
          <FlatList
            ref={flatListRef}
            horizontal
            pagingEnabled
            data={sliderImages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ width }}>
                <Image
                  source={item.image}
                  style={styles.sliderImage}
                  resizeMode="cover"
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveSlide(index);
            }}
          />
          <View style={styles.dotsContainer}>
            {sliderImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeSlide === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Categories</Text>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  selectedCategory === item.id && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === item.id ? null : item.id
                )}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === item.id && styles.selectedCategoryText,
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoryList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Top Rated Restaurants (4.7+ rating) */}
        {topRatedRestaurants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Top Rated (4.7+)</Text>
            <FlatList
              horizontal
              data={topRatedRestaurants}
              renderItem={renderTopRatedItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.topRatedList}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={bannerImage}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* All Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>All Restaurants</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Resturants')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {filteredRestaurants.length > 0 ? (
            <FlatList
              horizontal
              data={filteredRestaurants}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.restaurantList}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No restaurants found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'orange',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    left: -20
  },
  profileButton: {
    padding: 5,
    zIndex: 1,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4682B4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: width * 0.75,
    backgroundColor: 'orange',
    height: '100%',
    padding: 20,
  },
  sidebarHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sidebarProfileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 5,
    position: 'relative',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
  },
  sidebarNotificationBadge: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarNotificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    height: height * 0.25,
    width: '100%',
    marginBottom: 15,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#4682B4',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  section: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4682B4',
  },
  categoryList: {
    paddingVertical: 5,
  },
  categoryItem: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  selectedCategory: {
    backgroundColor: 'orange',
  },
  categoryText: {
    color: '#333',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  restaurantCard: {
    width: 180,
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 15,
    padding: 10,
    elevation: 2,
  },
  restaurantImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  restaurantDetails: {
    marginTop: 8,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  restaurantRating: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  restaurantLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    flexShrink: 1,
  },
  topRatedCard: {
    width: 150,
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 15,
    padding: 10,
    elevation: 2,
  },
  topRatedImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  topRatedDetails: {
    marginTop: 8,
  },
  topRatedName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  topRatedRating: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  restaurantList: {
    paddingBottom: 5,
  },
  topRatedList: {
    paddingBottom: 5,
  },
  bannerContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 120,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  notificationModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationList: {
    padding: 15,
  },
  emptyNotificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  markAllReadButton: {
    padding: 10,
    backgroundColor: '#4682B4',
    borderRadius: 5,
    margin: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  markAllReadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notificationItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadNotificationItem: {
    backgroundColor: '#f0f7ff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4682B4',
    marginLeft: 8,
  },
});

export default Homescreen;