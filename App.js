import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainStackNavigator from './src/navigations/MainStackNavigator';
import SplashScreen from 'react-native-splash-screen';
import AuthWrapper from './src/components/Authwrapper/AuthWrapper';
import CustomDrawer from './src/navigations/CustomDrawer';
import { createDrawerNavigator } from '@react-navigation/drawer';
import useUserStore from './src/components/store/UserStore';

const Drawer = createDrawerNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const drawerRef = useRef(null);

  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const [wasAuthenticated, setWasAuthenticated] = useState(false); // track login transition

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      SplashScreen.hide();
    }, 1500);
    return () => clearTimeout(timer);
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
  <AuthWrapper>
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        drawerType: 'front',
        drawerStyle: { width: 280 },
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name={isAuthenticated ? 'MainApp' : 'Auth'}
        component={MainStackNavigator}
      />
    </Drawer.Navigator>
  </AuthWrapper>
</NavigationContainer>

  );
}
