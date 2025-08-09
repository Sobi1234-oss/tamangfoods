import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';

export const sendOrderNotification = async (notificationData) => {
  try {
    // First get admin user data
    const adminSnapshot = await firestore()
      .collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (adminSnapshot.empty) {
      console.log('No admin found');
      return null;
    }

    const admin = adminSnapshot.docs[0].data();
    const adminId = adminSnapshot.docs[0].id;

    // Create the notification document with all required fields
    const notificationDoc = {
      ...notificationData,
      adminId: adminId,
      recipientId: notificationData.customerId || adminId, // Add recipientId
      recipientType: notificationData.type === 'status_update' ? 'customer' : 'admin', // Add recipientType
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp()
    };

    // Add the notification to Firestore
    const notificationRef = await firestore()
      .collection('notifications')
      .add(notificationDoc);

    // Determine which FCM token to use
    const targetToken = notificationData.type === 'status_update' 
      ? (await firestore().collection('users').doc(notificationData.customerId).get()).data()?.fcmToken
      : admin.fcmToken;

    if (targetToken) {
      try {
        const message = {
          notification: {
            title: notificationData.type === 'status_update' 
              ? 'Order Status Updated' 
              : 'New Order Received',
            body: notificationData.type === 'status_update'
              ? notificationData.message || 'Your order status has been updated'
              : `Order from ${notificationData.customerName || 'Customer'} - Rs. ${notificationData.grandTotal || 0}`
          },
          data: {
            type: notificationData.type || 'new_order',
            orderId: notificationData.orderId || '',
            notificationId: notificationRef.id
          },
          token: targetToken
        };
        
        await messaging().sendMessage(message);
      } catch (fcmError) {
        console.error('FCM send error:', fcmError);
      }
    }

    return notificationRef.id;
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
};

// Store FCM token for user
export const storeFCMToken = async (userId) => {
  try {
    const token = await messaging().getToken();
    if (token) {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          fcmToken: token,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      console.log('FCM token stored successfully');
    }
  } catch (error) {
    console.error('Error storing FCM token:', error);
  }
};