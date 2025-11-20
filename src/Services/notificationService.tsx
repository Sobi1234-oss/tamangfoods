// Services/notificationService.ts
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

type NotificationInput = {
  customerId?: string;
  customerName?: string;
  orderId?: string;
  grandTotal?: number;
  status?: string;
  type: 'new_order' | 'status_update' | string;
  // any additional metadata...
};

export const sendOrderNotification = async (notificationData: NotificationInput) => {
  try {
    // Find an admin user (first found)
    const adminSnapshot = await firestore()
      .collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (adminSnapshot.empty) {
      console.warn('sendOrderNotification: No admin found');
      return null;
    }

    const adminDoc = adminSnapshot.docs[0];
    const adminId = adminDoc.id;

    // Determine recipient
    const isStatusUpdate = notificationData.type === 'status_update';
    const recipientId = isStatusUpdate ? notificationData.customerId : adminId;
    const recipientType = isStatusUpdate ? 'customer' : 'admin';

    // Build notification object
    const notificationDoc = {
      ...notificationData,
      adminId,
      recipientId: recipientId || null,
      recipientType,
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    // Insert notification in Firestore
    const ref = await firestore().collection('notifications').add(notificationDoc);

    console.log('sendOrderNotification: created notification', ref.id, 'recipient:', recipientId, 'type:', notificationData.type);

    // Optionally: Send push via FCM here using adminDoc.fcmToken or Cloud Function
    // We prefer Cloud Function to send FCM to avoid exposing server keys in client.

    return ref.id;
  } catch (error) {
    console.error('sendOrderNotification error:', error);
    throw error;
  }
};

export const storeFCMToken = async (userId: string) => {
  try {
    const token = await messaging().getToken();
    if (!token) {
      console.warn('storeFCMToken: no token returned');
      return;
    }

    // Use set with merge to avoid overwriting
    await firestore().collection('users').doc(userId).set({
      fcmToken: token,
      updatedAt: firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('storeFCMToken saved for user', userId);
  } catch (error) {
    console.error('storeFCMToken error:', error);
  }
};
