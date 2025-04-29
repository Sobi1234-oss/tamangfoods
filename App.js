import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screens here
import Splash from './Splash';
import Login from './Login';
import Loginwithphone from './Loginwithphone';
import Signup from './Signup';
import Forget from './Forget';
import Reset from './Reset';
import Homescreen from './Homescreen';
import Walkthrough from './Walkthrough';
import Verifyphone from './Verifyphone';
import Enteradress from './Enteradress';
import Addproducts from './Addproducts';
import Addcategory from './Addcategory';
import Dashboard from './Dashboard';
import Menu from './Menu';
import Cart from './Cart';
import ProductDetais from './ProductDetais';
import AddResturant from './AddResturant';
import Resturants from './Resturants';
import Resturantdetails from './Resturantdetails';
import LocationSearchScreen from './LocationSearchScreen';
import LocationScreen from './LocationScreen';
import AdminScreen from './AdminScreen';
import Contact from './Contact';
import OrderScreen from './OrderScreen';
import Order from './Order';
import AdminDashboard from './AdminDashboard'
import ComplaintForm from './ComplaintForm'
import NotificationScreen from './NotificationScreen'
import OrderConfirmation from './OrderConfirmation'
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Admin Tab Navigator
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'white',
          height: 55,
          borderWidth: 1,
          borderRadius: 0,
          width: '100%',
          position: 'absolute',
          bottom: 0,
          alignItems: 'center',
          paddingBottom: 10,
        },
        tabBarActiveTintColor: 'orange',
        tabBarInactiveTintColor: 'grey',
      }}
    >
      <Tab.Screen
        name="AdminScreen"
        component={AdminScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="items"
        component={Resturants}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="list" size={25} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={Dashboard}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="add-circle" size={40} color="black" />
          ),
          tabBarButton: (props) => (
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                {...props}
                style={{
                  top: -30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'royalblue',
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  shadowColor: "white",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                }}
              >
                <Icon name="add" size={40} color="white" />
              </TouchableOpacity>
              <Text style={styles.sellNowText}>Add</Text>
            </View>
          ),
        }}
      />
     
      <Tab.Screen
        name="Notifications"
        component={OrderScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="notifications" size={25} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// User Tab Navigator
const UserTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'white',
          height: 55,
          borderWidth: 1,
          borderRadius: 0,
          width: '100%',
          position: 'absolute',
          bottom: 0,
          alignItems: 'center',
          paddingBottom: 10,
        },
        tabBarActiveTintColor: 'orange',
        tabBarInactiveTintColor: 'grey',
      }}
    >
      <Tab.Screen
        name="Homescreen"
        component={Homescreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Resturants"
        component={Resturants}
        options={{
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <Icon name="list" size={25} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="cart" size={25} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Chats"
        component={Order}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="chatbubbles" size={25} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Component
export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="royalblue" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={'Splash'}>
        {/* Splash Screen */}
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />

        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Loginwithphone"
          component={Loginwithphone}
          options={{ headerShown: true}}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Forget"
          component={Forget}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Reset"
          component={Reset}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Verifyphone"
          component={Verifyphone}
          options={{ headerShown: true }}
        />

        {/* Walkthrough and Address Screens */}
        <Stack.Screen
          name="Walkthrough"
          component={Walkthrough}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Enteradress"
          component={Enteradress}
          options={{ headerShown: false }}
        />

        {/* Product and Restaurant Screens */}
        <Stack.Screen
          name="Addproducts"
          component={Addproducts}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Addcategory"
          component={Addcategory}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="AddResturant"
          component={AddResturant}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Resturantdetails"
          component={Resturantdetails}
          options={{ headerShown: true }}
        />
         <Stack.Screen
          name="Resturants"
          component={Resturants}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="ProductDetais"
          component={ProductDetais}
          options={{ headerShown: true }}
        />

        {/* Location Screens */}
        <Stack.Screen
          name="LocationSearchScreen"
          component={LocationSearchScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LocationScreen"
          component={LocationScreen}
          options={{ headerShown: false }}
        />
       <Stack.Screen
          name="OrderConfirmation"
          component={OrderConfirmation}
          options={{ headerShown: true }}
        />
        {/* Admin and User Tabs */}
        <Stack.Screen
          name="AdminScreen"
          component={AdminTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Homescreen"
          component={UserTabNavigator}
          options={{ headerShown: false }}
        />
       
        {/* Other Screens */}
        <Stack.Screen
          name="Menu"
          component={Menu}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Contact"
          component={Contact}
          options={{ headerShown: false }}
        />
           <Stack.Screen
          name="Cart"
          component={Cart}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
      <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{ headerShown: true }}
        />
         <Stack.Screen
          name="ComplaintForm"
          component={ComplaintForm}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="NotificationScreen"
          component={NotificationScreen}
          options={{ headerShown: true }}
        />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sellNowText: {
    fontSize: 12,
    color: 'black',
    marginTop: 5,
  },
});