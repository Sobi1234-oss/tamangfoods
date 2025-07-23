import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useUserStore from '../components/store/UserStore';
const CustomDrawer = (props) => {
  const user = useUserStore(state => state.user);
  const logout = useUserStore(state => state.logout);
  const navigation = props.navigation;

  const handleLogout = () => {
    logout();
    props.navigation.closeDrawer();
  };

  const handleClose = () => {
    navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.userAvatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.userAvatar} />
            ) : (
              <Ionicons name="person-circle" size={60} color="#fff" />
            )}
            <View style={{ marginTop: 10 }}>
              <Text style={styles.userName}>{user?.fullName || 'Guest User'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <View style={styles.menuSection}>
          <DrawerItem
            label="Home"
            labelStyle={styles.labelStyle}
            icon={({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />}
            onPress={() => navigation.navigate('MainApp', { screen: 'Homescreen' })}
          />
          <DrawerItem
            label="Menu"
            labelStyle={styles.labelStyle}
            icon={({ color, size }) => <Ionicons name="fast-food-outline" size={size} color={color} />}
            onPress={() =>navigation.navigate('MainApp', {
  screen: 'UserTabs',
  params: {
    screen: 'Menu',
  },
})}
          />
          <DrawerItem
            label="Orders"
            labelStyle={styles.labelStyle}
            icon={({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />}
            onPress={() => navigation.navigate('MainApp', {
  screen: 'UserTabs',
  params: {
    screen: 'Orders',
  },
})}
          />
          <DrawerItem
            label="Cart"
            labelStyle={styles.labelStyle}
            icon={({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />}
            onPress={() => navigation.navigate('MainApp', {
  screen: 'UserTabs',
  params: {
    screen: 'Cart',
  },
})}
          />
        </View>
      </DrawerContentScrollView>

      {/* Logout Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF4E4E" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawer;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#FF6D42',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  userAvatarContainer: {
    alignItems: 'center',
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#fefefe',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  menuSection: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  labelStyle: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4E4E',
    marginLeft: 10,
  },
});
