const admin = require('firebase-admin');
const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Initialize SendGrid (optional - set via firebase functions:config:set sendgrid.key="YOUR_KEY")
const sendGridKey = functions.config().sendgrid?.key || null;
if (sendGridKey) {
  sgMail.setApiKey(sendGridKey);
}

/**
 * Cloud Function: Triggered when a new notification document is created in Firestore
 * 
 * Flow:
 * 1. Client writes notification doc to /notifications/{notificationId}
 * 2. This function triggers onCreate
 * 3. Reads recipient's FCM token from /users/{recipientId}
 * 4. Sends FCM message to device
 * 5. Optionally sends email via SendGrid
 * 
 * Expected notification document structure:
 * {
 *   type: "new_order" | "status_update",
 *   orderId: string,
 *   customerId: string,
 *   customerName: string,
 *   grandTotal: number,
 *   message: string,
 *   adminId: string,
 *   recipientId: string,
 *   recipientType: "admin" | "customer",
 *   read: false,
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */
exports.onNotificationCreated = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    try {
      const notificationData = snap.data();
      const { recipientId, type, message, customerName, orderId, adminId, productName } = notificationData;

      // ✅ Step 1: Get recipient's FCM token
      const userDoc = await db.collection('users').doc(recipientId).get();

      if (!userDoc.exists) {
        console.warn(`User ${recipientId} not found in database`);
        return;
      }

      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        console.warn(`No FCM token for user ${recipientId}`);
        return;
      }

      // ✅ Step 2: Prepare FCM payload based on notification type
      let fcmTitle = '';
      let fcmBody = '';
      let fcmData = {};

      if (type === 'new_order') {
        // 🔴 Admin receives new order notification
        fcmTitle = 'New Order Received 🎉';
        fcmBody = message || `New order from ${customerName}`;
        fcmData = {
          type: 'new_order',
          orderId: orderId,
          customerName: customerName,
          screen: 'Order'
        };
      } else if (type === 'status_update') {
        // 🟢 Customer receives order completed notification
        fcmTitle = 'Order Completed ✅';
        const productPart = productName ? ` ${productName}` : '';
        fcmBody = message || `Your${productPart} order is ready!`;
        fcmData = {
          type: 'status_update',
          orderId: orderId,
          screen: 'NotificationScreen'
        };
      } else if (type === 'order_submitted') {
        // 🟡 Customer receives confirmation that their order was submitted
        fcmTitle = 'Order Submitted';
        const productPart = productName ? ` ${productName}` : '';
        fcmBody = message || `Your${productPart} order has been submitted. Please wait for admin response.`;
        fcmData = {
          type: 'order_submitted',
          orderId: orderId,
          screen: 'NotificationScreen'
        };
      }

      // ✅ Step 3: Send FCM notification
      const response = await messaging.send({
        token: fcmToken,
        notification: {
          title: fcmTitle,
          body: fcmBody
        },
        data: fcmData,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          headers: {
            'apns-priority': '10'
          },
          payload: {
            aps: {
              sound: 'default',
              'content-available': 1
            }
          }
        }
      });

      console.log('✅ FCM sent successfully:', response);

      // ✅ Step 4: Optional - Send email to admin (only for new orders)
      if (type === 'new_order' && sendGridKey) {
        try {
          // Get admin email from database
          const adminDoc = await db.collection('users').doc(adminId).get();
          const adminEmail = adminDoc.data()?.email;

          if (adminEmail) {
            const emailMsg = {
              to: adminEmail,
              from: 'noreply@tamangfoods.com', // Use your verified sender email
              subject: `New Order Received from ${customerName}`,
              html: `
                <h2>New Order Alert 🎉</h2>
                <p>You have received a new order!</p>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Amount:</strong> Rs. ${notificationData.grandTotal}</p>
                <p><strong>Message:</strong> ${message}</p>
                <br/>
                <p>Please log in to your admin panel to view and process this order.</p>
              `
            };

            await sgMail.send(emailMsg);
            console.log('✅ Email sent to admin:', adminEmail);
          }
        } catch (emailError) {
          console.warn('⚠️ Email send failed (non-critical):', emailError.message);
          // Don't throw - email is optional
        }
      }

      return { success: true, messageId: response };

    } catch (error) {
      console.error('❌ Error in onNotificationCreated:', error);
      throw error;
    }
  });

/**
 * Optional: Cleanup function to delete old notifications (runs daily)
 * Deletes notifications older than 30 days
 */
exports.deleteOldNotifications = functions.pubsub
  .schedule('every day 02:00')
  .timeZone('Asia/Kathmandu')
  .onRun(async (context) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldNotifications = await db
        .collection('notifications')
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .get();

      const batch = db.batch();
      oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`✅ Deleted ${oldNotifications.size} old notifications`);
      return { deleted: oldNotifications.size };

    } catch (error) {
      console.error('❌ Error in deleteOldNotifications:', error);
      throw error;
    }
  });
