/* Mobile Server API's Assumed-
sendTestRequestToDevice = GET API for PING
sendTestRequestToDevice = POST API to push Notification
*/

const pendingNotificationsQueue = []; //! QUEUE CONTAINING PENDING NOTIFICATION, WE CAN HAVE A DB FOR IT
const maxRetries = 3;

//PING DEVICE
async function pingDevice(deviceID) {
  try {
    const response = await sendTestRequestToDevice(deviceID);
    return response.status === "success";
  } catch (error) {
    console.error(`Error pinging device ${deviceID}: ${error}`);
    return false;
  }
}

//PUSH NOTIFICATION TO PHONE
async function sendNotificationToPhoneServer(deviceID, notificationContent) {
  const response = await sendTestRequestToDevice(deviceID, notificationContent);
  if (response.success) {
    return { status: "success" };
  } else {
    throw new Error("Error sending notification to phone server");
  }
}

//PUSH NOTIFICATION TO PHONE - MASTER
async function sendNotificationWithRetry(
  notifyId,
  deviceID,
  notificationContent,
  timestamp
) {
  let attempt = 1;
  while (attempt <= maxRetries) {
    try {
      const result = await sendNotificationToPhoneServer(
        notifyId,
        deviceID,
        notificationContent,
        timestamp
      );
      console.log(`Notification attempt ${attempt}: ${result.status}`);
      return result;
    } catch (error) {
      console.error(`Notification attempt ${attempt} failed: ${error}`);
      attempt++;
    }
  }
  throw new Error("Max retry attempts reached. Notification failed.");
}

// STORE PENDING NOTIFICATION IN QUEUE
function storePendingNotification(notifyId, deviceID, timestamp) {
  pendingNotificationsQueue.push({ notifyId, deviceID, timestamp });
}

// CHECKING NOTIFICATION STATUS
async function checkNotificationStatus(notifyId) {
  try {
    const notification = await Notification.findOne({ notifyId });

    if (!notification) {
      throw new Error("Notification not found");
    }

    return { status: notification.status };
  } catch (error) {
    console.error(`Error checking notification status: ${error}`);
    throw error;
  }
}

// SAVING NOTIFICATION RECORD TO DB
async function saveNotificationToDatabase(
  deviceID,
  applicationType,
  notificationContent,
  timestamp
) {
  try {
    const newNotification = new Notification({
      deviceID,
      applicationType,
      notificationContent,
      timestamp,
    });

    await newNotification.save();
    return newNotification;
  } catch (error) {
    console.error(`Error saving notification to the database: ${error}`);
    throw error;
  }
}

// UPDATING STATUS IN DB
async function updateNotificationStatus(notifyId, status) {
  try {
    await Notification.updateOne({ notifyId }, { $set: { status } });
  } catch (error) {
    console.error(
      `Error updating notification status in the database: ${error}`
    );
    throw error;
  }
}

// DELETING NOTIFICATION WITH PENDING STATUS
async function deletePendingNotification(notifyId) {
  try {
    const notification = await Notification.findOne({ notifyId });

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.status !== "pending") {
      throw new Error(
        "Notification cannot be deleted because it is not in pending status"
      );
    }

    notification.isDeleted = true;

    await notification.save();

    return { success: true, message: "Notification marked as deleted." };
  } catch (error) {
    console.error(`Error marking notification as deleted: ${error}`);
    throw error;
  }
}

// FETCH NOTIFICATION DETAILS FROM DB
async function fetchNotificationDetails(notifyId) {
  try {
    const notification = await Notification.findOne({ notifyId });

    if (!notification) {
      throw new Error("Notification not found");
    }

    return notification;
  } catch (error) {
    console.error(`Error checking notification status: ${error}`);
    throw error;
  }
}

//? SAMPLE NOTIFICATION SCHEMA
// notificationSchema = {
//   notifyId: { type: ObjectId, required: true, unique: true },
//   deviceID: { type: String, required: true },
//   applicationType: { type: String, required: true },
//   notificationContent: { type: String, required: true },
//   timestamp: { type: Date, required: true },
//   status: { type: String, default: "pending" },
//   isDeleted: { type: Boolean, default: false },
// };
