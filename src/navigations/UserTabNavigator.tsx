import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import useUserStore from '../components/store/UserStore'; // Import your user store

import Homescreen from '../screens/home/Homescreen';
import Cart from '../screens/cart/Cart';
import Order from '../screens/order/Order';
import Menu from '../screens/menu/Menu';
import Add from '../screens/Add products/Add';

const Tab = createBottomTabNavigator();

const CustomAddButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.addButtonContainer} onPress={onPress}>
      <View style={styles.addButton}>
        <Ionicons name="add" size={32} color="white" />
      </View>
    </TouchableOpacity>
  );
};

const UserTabNavigator = () => {
  const navigation = useNavigation();
  const user = useUserStore(state => state.user); // Get user from store
  const isAdmin = user?.role === 'admin'; // Check if user is admin

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
              <Ionicons name="home" size={24} color={color} />
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
              <Ionicons name="list" size={24} color={color} />
            </View>
          ),
        }}
      />
      {/* Conditionally render Add button only for non-admin users */}
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
              <Ionicons name="cart" size={24} color={color} />
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
              <Ionicons name="chatbubbles" size={24} color={color} />
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
    height:55,
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
    marginBottom:0
  },
  tabLabel: {
    fontSize: 12,
    

  },
});

export default UserTabNavigator;