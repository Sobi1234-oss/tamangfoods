// Services/notificationsHandler.ts
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';
import { storeFCMToken } from './notificationService';

let navigationRef = null;
export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  } catch (error) {
    console.error('requestNotificationPermission error:', error);
    return false;
  }
};

export const setupForegroundHandler = () => {
  messaging().onMessage(async remoteMessage => {
    console.log('Foreground message received:', remoteMessage);
    Alert.alert(
      remoteMessage.notification?.title || 'New Notification',
      remoteMessage.notification?.body || 'You have a new message'
    );
  });
};

export const setupBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message:', remoteMessage);
    // background handling (no UI here)
  });
};

export const setupNotificationOpenedHandler = () => {
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification opened from background state:', remoteMessage);
    try {
      const type = remoteMessage?.data?.type;
      if (type === 'new_order') {
        navigationRef?.navigate('AdminOrders');
      } else if (type === 'status_update') {
        navigationRef?.navigate('OrderDetails', { orderId: remoteMessage?.data?.orderId });
      } else {
        // fallback
        navigationRef?.navigate('NotificationScreen');
      }
    } catch (err) {
      console.error('onNotificationOpenedApp nav error:', err);
    }
  });

  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log('Opened app from quit state via notification:', remoteMessage);
      const type = remoteMessage?.data?.type;
      if (type === 'new_order') {
        navigationRef?.navigate('AdminOrders');
      } else if (type === 'status_update') {
        navigationRef?.navigate('OrderDetails', { orderId: remoteMessage?.data?.orderId });
      } else {
        navigationRef?.navigate('NotificationScreen');
      }
    }
  }).catch(err => console.error('getInitialNotification error:', err));
};

export const initializeNotifications = () => {
  // request permission then setup handlers
  requestNotificationPermission().then(hasPerm => {
    if (hasPerm) {
      setupForegroundHandler();
      setupBackgroundHandler();
      setupNotificationOpenedHandler();
    } else {
      console.warn('User did not grant notification permission');
    }
  });

  // save FCM token on auth change
  auth().onAuthStateChanged(user => {
    if (user) {
      requestNotificationPermission().then(async (hasPerm) => {
        if (hasPerm) {
          await storeFCMToken(user.uid);
        }
      });
    }
  });
};
