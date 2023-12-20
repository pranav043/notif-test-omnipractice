// Import {Helper Functions} from "./helpers"

app.post("/notifications", async (req, res) => {
  try {
    const { applicationType, notificationContent, deviceID, timestamp } =
      req.body;

    if (!applicationType || !notificationContent || !deviceID || !timestamp) {
      throw new Error("Invalid request: Missing required parameters.");
    }

    const notifyRecord = await saveNotificationToDatabase(
      deviceID,
      applicationType,
      notificationContent,
      timestamp
    );

    const isDeviceActive = await pingDevice(deviceID);

    if (isDeviceActive) {
      const notificationStatus = await sendNotificationWithRetry(
        notifyRecord.notifyId,
        deviceID,
        notificationContent,
        timestamp
      );

      if (notificationStatus) {
        await updateNotificationStatus(
          notifyRecord.notifyId,
          notificationStatus.status
        );
      }

      res.status(200).json({ success: true, status: notificationStatus });
    } else {
      storePendingNotification(notifyRecord.notifyId, deviceID, timestamp);
      res.status(202).json({
        success: true,
        message: "Notification will be sent when the device is online.",
      });
    }
  } catch (error) {
    console.error(`Error processing notification: ${error}`);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/notifications/:notifyId/status", (req, res) => {
  try {
    const notifyId = req.params.notifyId;
    const notificationStatus = checkNotificationStatus(notifyId);
    res.status(200).json({ success: true, status: notificationStatus });
  } catch (error) {
    console.error(`Error checking notification status: ${error}`);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete("/notifications/:notifyId", (req, res) => {
  try {
    const notifyId = req.params.notifyId;
    deletePendingNotification(notifyId);
    res
      .status(204)
      .json({ success: true, message: "Notification deleted successfully." });
  } catch (error) {
    console.error(`Error deleting notification: ${error}`);
    res.status(400).json({ success: false, error: error.message });
  }
});
