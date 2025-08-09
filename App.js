import React, { useEffect, useState,useRef } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SplashScreen from 'react-native-splash-screen';
import MainStackNavigator from './src/navigations/MainStackNavigator';
import AuthWrapper from './src/components/Authwrapper/AuthWrapper';
import CustomDrawer from './src/navigations/CustomDrawer';
import useUserStore from './src/components/store/UserStore';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { setNavigationRef, setupForegroundHandler, setupBackgroundHandler } from './src/Services/notificationHandler';
const Drawer = createDrawerNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const user = useUserStore(state => state.user);
   const navigationRef = useRef();



     useEffect(() => {
    setNavigationRef(navigationRef.current);
    setupForegroundHandler();
    setupBackgroundHandler();

    // Request notification permission
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    };

    requestPermission();
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hide();
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Request notification permissions
    const requestNotificationPermission = async () => {
      if (Platform.OS === 'ios') {
        await messaging().requestPermission();
      }

      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // Save the token to the user's document in Firestore
      if (user?.uid) {
        await firestore().collection('users').doc(user.uid).update({
          fcmToken: token,
        });
      }
    };

    requestNotificationPermission();

    // Handle foreground notifications
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification:', remoteMessage);
      await displayNotification(remoteMessage.notification);
    });

    // Handle notification taps
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened:', remoteMessage);
      // You can navigate to specific screens based on notification data
    });

    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
        }
      });

    return () => {
      unsubscribeForeground();
    };
  }, [user]);

  const displayNotification = async (notification) => {
    await notifee.requestPermission();
    
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    await notifee.displayNotification({
      title: notification.title,
      body: notification.body,
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
    });
  };

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
};

export default App;