// Import {Helper Functions} from "./helpers"

//* Cron job running every minute for PENDING Notifications
cron.schedule("* * * * *", async () => {
  try {
    await Promise.all(
      pendingNotificationsQueue.map(async ({ notifyId, deviceId }) => {
        const isDeviceOnline = await pingDevice(deviceId);

        if (isDeviceOnline) {
          const notificationDetails = await fetchNotificationDetails(notifyId);
          const { content, timeStamp: notificationTimeStamp } =
            notificationDetails;

          if (notificationTimeStamp <= new Date()) {
            const notificationStatus = await sendNotificationWithRetry(
              deviceId,
              content,
              notificationTimeStamp
            );

            await updateNotificationStatus(notifyId, notificationStatus.status);

            RemoveFromQueue(notifyId); //TO remove success notification from queue
          } else {
            await updateNotificationStatus(notifyId, "expired");
            await InformUser(
              notifyId,
              "FAIL",
              `Notification with notifyId ${notifyId} expired. User did not log in.`
            ); //Informing user of expired notification if we are unable to push it until timestamp time
          }
        }
      })
    );
  } catch (error) {
    console.error(`Error processing pending notification: ${error.message}`);
  }
});
