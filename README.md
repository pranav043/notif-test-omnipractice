# Notification Service

This is a test Notification Service of a Phone Company that gives API to other companies & sends to native phone servers. While i have tried to make the code as practical as possible, its a Pseudocode, so contains various assumptions.

## FILES-

- api.js: Contains API we support for users
- helpers.js: Contains helper function we use
- queueCronJob.js: Cron Job for Updating Pending Notifications present in Queue

## API Endpoints

### 1. POST /notifications

- **Purpose:** Accepts notification requests from mobile applications.
- **Parameters:**
  - `appType`: Type of the mobile application.
  - `content`: Content of the notification.
  - `deviceId`: Unique identifier for the target device.
  - `timeStamp`: Timestamp for the notification.

### 2. GET /notifications/:notifyId/status

- **Purpose:** Retrieves the status of a notification based on its notifyId.
- **Parameters:**
  - `notifyId`: Unique identifier for the notification.

### 3. DELETE /notifications/:notifyId

- **Purpose:** Deletes a pending notification based on its notifyId.
- **Parameters:**
  - `notifyId`: Unique identifier for the notification.

## Helper Functions

The helper functions provide essential functionalities for the Notification Service:

- `pingDevice(deviceId)`: Pings the device to check its online status.
- `sendNotificationToPhoneServer(deviceId, content)`: Sends a notification to the target device.
- `sendNotificationWithRetry(notifyId, deviceId, content, timeStamp, maxRetries)`: Attempts to send a notification with retry logic.
- `saveNotificationToDatabase(deviceId, appType, content, timeStamp)`: Saves a notification record to the database.
- `updateNotificationStatus(notifyId, status)`: Updates the status of a notification in the database.
- `storePendingNotification(notifyId, deviceId, timeStamp)`: Stores a pending notification in the queue.
- `checkNotificationStatus(notifyId)`: Checks the status of a notification in the database.
- `deletePendingNotification(notifyId)`: Marks a pending notification as deleted in the database.
- `fetchNotificationDetails(notifyId)`: Fetches details of a notification from the database.

## Cron Job

The cron job runs every minute to process pending notifications in the queue. It checks the online status of devices, sends notifications if applicable, and updates the status in the database.

## Notification Schema

The assumed schema for notifications in the database:

```javascript
notificationSchema = {
  notifyId: { type: ObjectId, required: true, unique: true },
  deviceId: { type: String, required: true },
  appType: { type: String, required: true },
  content: { type: String, required: true },
  timeStamp: { type: Date, required: true },
  status: { type: String, default: "pending" },
  isDeleted: { type: Boolean, default: false },
};
```
