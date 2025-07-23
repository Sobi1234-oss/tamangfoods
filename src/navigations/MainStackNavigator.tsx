import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UserTabNavigator from './UserTabNavigator';

import Splash from '../screens/Welcome/Splash';
import Login from '../screens/Auth/Login';
import Loginwithphone from '../screens/Auth/Loginwithphone';
import Signup from '../screens/Auth/Signup';
import Forget from '../screens/Auth/Forget';
import Reset from '../screens/Auth/Reset';
import Walkthrough from '../screens/Welcome/Walkthrough';
import Verifyphone from '../screens/Auth/Verifyphone';
import ProductDetais from '../screens/products/ProductDetais';
import NotificationScreen from '../screens/notification/NotificationScreen';
import Products from '../screens/products/Products';
import CategorywiseProducts from '../screens/products/CategorywiseProducts';
import Add from '../screens/Add products/Add';
import Addcategory from '../screens/Add products/Addcategory';
import Addproducts from '../screens/Add products/Addproducts';
import CheckOut from '../screens/checkout/CheckOut';
import OrderDetails from '../screens/order/OrderDetails';
const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash">
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Loginwithphone"
        component={Loginwithphone}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{ headerShown: false }}
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
        <Stack.Screen
        name="OrderDetails"
        component={OrderDetails}
        options={{ headerShown: false }}
      />

      {/* Main App Screens */}
     <Stack.Screen name="UserTabs" component={UserTabNavigator} options={{ headerShown: false }}/>
      <Stack.Screen
        name="Walkthrough"
        component={Walkthrough}
        options={{ headerShown: false }}
      />
     
      <Stack.Screen
        name="ProductDetais"
        component={ProductDetais}
        options={{ headerShown: false }}
      />
    
     
      
      
       <Stack.Screen
        name="CheckOut"
        component={CheckOut}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
        options={{ headerShown: true }}
      />
       <Stack.Screen
        name="Products"
        component={Products}
        options={{ headerShown: false }}
      />
        <Stack.Screen
        name="CategorywiseProducts"
        component={CategorywiseProducts}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="Addproducts"
        component={Addproducts}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Addcategory"
        component={Addcategory}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Add"
        component={Add}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;