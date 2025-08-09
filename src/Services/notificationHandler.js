import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth'; // Add this import
import { Alert } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { storeFCMToken } from '../Services/notificationService';

let navigationRef;

export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

// Request notification permission
const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

// Handle foreground messages
export const setupForegroundHandler = () => {
  messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground notification:', remoteMessage);
    Alert.alert(
      remoteMessage.notification?.title || 'New Notification',
      remoteMessage.notification?.body || 'You have a new message'
    );
  });
};

// Handle background messages
export const setupBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background notification:', remoteMessage);
  });
};

// Handle notification opens
export const setupNotificationOpenedHandler = () => {
  messaging().onNotificationOpenedApp((remoteMessage) => {
    if (remoteMessage.data && remoteMessage.data.type === 'new_order') {
      navigationRef?.navigate('AdminOrders');
    }
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage && remoteMessage.data.type === 'new_order') {
        navigationRef?.navigate('AdminOrders');
      }
    });
};

// Initialize all notification handlers
export const initializeNotifications = () => {
  setupForegroundHandler();
  setupBackgroundHandler();
  setupNotificationOpenedHandler();

  // Store FCM token when user logs in
  auth().onAuthStateChanged((user) => {
    if (user) {
      requestNotificationPermission().then((hasPermission) => {
        if (hasPermission) {
          storeFCMToken(user.uid);
        }
      });
    }
  });
};