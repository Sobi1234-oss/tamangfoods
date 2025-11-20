# Tamang Foods Firebase Cloud Functions

This folder contains Firebase Cloud Functions that handle sending push notifications and emails for the Tamang Foods app.

## 📋 Functions

### 1. `onNotificationCreated` (Primary)
- **Trigger**: Firestore collection `notifications` onCreate
- **Purpose**: Sends FCM push notifications and optional emails when an order event occurs
- **Flow**:
  1. Client writes notification doc to Firestore
  2. Function triggers automatically
  3. Reads recipient's FCM token from database
  4. Sends push notification to device
  5. Optionally sends email to admin

### 2. `deleteOldNotifications` (Cleanup)
- **Trigger**: Daily at 02:00 AM (Asia/Kathmandu timezone)
- **Purpose**: Removes notification records older than 30 days to save database storage

---

## 🚀 Deployment Instructions

### Prerequisites
- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged into Firebase: `firebase login`
- Project already set up in Firebase Console

### Step 1: Install Dependencies
From the `functions` folder:
```bash
cd functions
npm install
```

### Step 2: Deploy Functions
```bash
firebase deploy --only functions
```

Or if you want to deploy specific function:
```bash
firebase deploy --only functions:onNotificationCreated
```

### Step 3: View Logs
```bash
firebase functions:log
```

---

## 🔧 Configuration

### SendGrid Email (Optional)
To enable email notifications to admin when new orders arrive:

1. Get SendGrid API Key from [SendGrid Dashboard](https://app.sendgrid.com)
2. Set the key in Firebase:
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```

3. Update the email address in `index.js` (line ~110):
```javascript
from: 'noreply@yourdomain.com', // Change to your verified email
```

### Verify Sender Email in SendGrid
1. Go to SendGrid → Settings → Sender Authentication
2. Add and verify your sender email address
3. Use that email in the `from` field

---

## 📱 Expected Notification Structure

When client creates notification in Firestore, it should have:

```javascript
{
  type: "new_order" | "status_update",      // Type of notification
  orderId: "order123",                       // Order ID
  customerId: "cust456",                     // Customer UID
  customerName: "John Doe",                  // Customer name
  grandTotal: 1200,                          // Order amount
  message: "Your order has been confirmed",  // Notification message
  adminId: "admin789",                       // Admin UID (for new_order)
  recipientId: "user123",                    // Who receives this notification
  recipientType: "admin" | "customer",       // Recipient role
  read: false,                               // Unread flag
  createdAt: timestamp,                      // Server timestamp
  updatedAt: timestamp                       // Server timestamp
}
```

---

## 🔍 Notification Flow

### When Customer Places Order:
1. CheckOut.js calls `sendOrderNotification({type: 'new_order', ...})`
2. Notification doc created with `recipientType: 'admin'`, `recipientId: adminId`
3. Cloud Function triggers
4. FCM sent to admin's device
5. Admin sees notification on bell icon in HomeHeader

### When Admin Marks Order Complete:
1. Order.js calls `sendOrderNotification({type: 'status_update', ...})`
2. Notification doc created with `recipientType: 'customer'`, `recipientId: customerId`
3. Cloud Function triggers
4. FCM sent to customer's device
5. Customer sees notification on bell icon in HomeHeader

---

## ⚙️ Testing Locally

### Start Emulator:
```bash
firebase emulators:start --only functions
```

### Use Shell for Testing:
```bash
firebase functions:shell
```

Then in the shell:
```javascript
// Test function
> onNotificationCreated({data: {type: 'new_order', ...}}, {params: {notificationId: 'test'}})
```

---

## 🐛 Troubleshooting

### Function Not Triggering?
- Check that notification documents have correct structure
- Verify `recipientId` is a valid user UID
- Check Firebase Console → Functions tab for errors

### FCM Not Sending?
- Verify user has valid FCM token in database
- Check that `notificationHandler.js` is saving tokens correctly
- View function logs: `firebase functions:log`

### Email Not Sending?
- Verify SendGrid API key is set: `firebase functions:config:get`
- Check that sender email is verified in SendGrid
- Verify admin has email in their user document

---

## 📚 References

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Admin SDK](https://firebase.google.com/docs/database/admin/start)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)

---

## 📝 Notes

- Functions run in Node.js 18 runtime
- Maximum execution time: 9 minutes (for standard functions)
- Free tier includes 125,000 invocations per month
- Firestore triggers are billed per trigger invocation
