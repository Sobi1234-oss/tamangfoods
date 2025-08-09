import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import useUserStore from '../components/store/UserStore';
import { RootStackParamList } from './Types'; // Import your root param list

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
        {/* Green dot indicator */}
        <View style={styles.greenDot} />
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
    backgroundColor: '#90EE90', // Light green color
  },
 
});

export default UserTabNavigator;