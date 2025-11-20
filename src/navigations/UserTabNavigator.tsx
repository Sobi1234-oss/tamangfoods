import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import useUserStore from '../components/store/UserStore';
import { RootStackParamList } from './Types'; // Import your root param list
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Screens
import Homescreen from '../screens/home/Homescreen';
import Cart from '../screens/cart/Cart';
import Order from '../screens/order/Order';
import Menu from '../screens/menu/Menu';
import Add from '../screens/Add products/Add';

// Define your tab param list
type UserTabParamList = {
  Home: undefined;
  Menu: undefined;
  Add: undefined;
  Cart: undefined;
  Orders: undefined;
};

const Tab = createBottomTabNavigator<UserTabParamList>();

type CustomAddButtonProps = {
  onPress: () => void;
};

const CustomAddButton: React.FC<CustomAddButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.addButtonContainer} onPress={onPress}>
      <View style={styles.addButton}>
        <Ionicons name="add" size={32} color="white" />
      </View>
    </TouchableOpacity>
  );
};

const UserTabNavigator: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const user = useUserStore(state => state.user);
  const isAdmin = user?.role === 'admin';
  const [newOrderCount, setNewOrderCount] = useState(0);

  // Fetch new orders count for admin
  useEffect(() => {
    if (!isAdmin) {
      setNewOrderCount(0);
      return;
    }

    const currentUser = auth().currentUser;
    if (!currentUser) {
      return;
    }

    const unsubscribe = firestore()
      .collection('orders')
      .where('status', '!=', 'completed')
      .onSnapshot(snapshot => {
        setNewOrderCount(snapshot.size);
      }, error => {
        console.error('Error fetching order count:', error);
      });

    return () => unsubscribe();
  }, [isAdmin]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'white',
          height: 70,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          paddingHorizontal: 0,
        },
        tabBarActiveTintColor: 'crimson',
        tabBarInactiveTintColor: '#778899',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Homescreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name="home-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={Menu}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name="list-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Add"
          component={Add}
          options={{
            tabBarButton: () => (
              <CustomAddButton onPress={() => navigation.navigate('Add')} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIconContainer}>
            <Ionicons name="cart-outline" size={24} color={color} />
            </View>
          ),
          
        }}
      />
   <Tab.Screen
  name="Orders"
  component={Order}
  options={{
    headerShown: false,
    tabBarIcon: ({ color }) => (
      <View style={styles.tabIconContainer}>
       <Ionicons name="receipt-outline" size={24} color={color} />
        {/* Badge indicator - show order count for admin when there are new orders */}
        {isAdmin && newOrderCount > 0 && (
          <View style={styles.badgeDot}>
            <Text style={styles.badgeText}>{newOrderCount > 9 ? '9+' : newOrderCount}</Text>
          </View>
        )}
      </View>
    ),
  }}
/>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  addButtonContainer: {
    top: -5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 55,
  },
  addButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: 'crimson',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: 'orange',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -5,
    marginBottom: 0,
  },
  greenDot: {
    position: 'absolute',
    right: -5,
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#90EE90',
  },
  badgeDot: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#FF3B30',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 5,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
 
});

export default UserTabNavigator;
