import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Text
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface HomeHeaderProps {
  navigation: any;
  onProfilePress: () => void;
  onSearch: (query: string) => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ navigation, onProfilePress, onSearch }) => {
  const scaleAnim = new Animated.Value(0.8);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch unread notifications count for current user
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const unsubscribe = firestore()
      .collection('notifications')
      .where('recipientId', '==', user.uid)
      .where('read', '==', false)
      .onSnapshot(querySnapshot => {
        setNotificationCount(querySnapshot.size);
      });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true
    }).start();
  }, []);

  const handleNotificationPress = async () => {
    const user = auth().currentUser;
    if (!user) return;

    // Mark all unread notifications as read
    const unreadNotifications = await firestore()
      .collection('notifications')
      .where('recipientId', '==', user.uid)
      .where('read', '==', false)
      .get();

    const batch = firestore().batch();
    
    unreadNotifications.forEach(doc => {
      const notificationRef = firestore().collection('notifications').doc(doc.id);
      batch.update(notificationRef, { read: true });
    });

    await batch.commit();
    setNotificationCount(0);
    navigation.navigate('NotificationScreen');
  };

  return (
    <LinearGradient
      colors={['#FF6D42', '#FF9E5A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <Animated.View style={[styles.profileContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
          <Image
            source={require('../../assets/images/profile.jpg')}
            style={styles.profileImage}
          />
          <View style={styles.profileActiveDot} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#FF6D42" style={styles.searchIcon} />
        <TextInput
          placeholder="Search food, drinks..."
          placeholderTextColor="#FF9E5A"
          style={styles.searchInput}
          onChangeText={onSearch}
        />
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="tune" size={20} color="#FF6D42" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={handleNotificationPress}
      >
        <Ionicons name="notifications" size={24} color="white" />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#FF6D42',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    position: 'relative',
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileActiveDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: 'white',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    height: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#FF6D42',
    fontSize: 15,
    fontFamily: 'Quicksand-Medium',
    marginHorizontal: 10,
  },
  searchIcon: {
    opacity: 0.8,
  },
  filterButton: {
    padding: 5,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
    shadowColor: 'red',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default HomeHeader;