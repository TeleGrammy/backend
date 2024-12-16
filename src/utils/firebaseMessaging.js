const admin = require("firebase-admin");
const serviceAccount = require("../telegrammy-firebase.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
/**
 * Sends a push notification to a specific topic.
 * @param {string} topic - The topic name (e.g., "chat_12345").
 * @param {string} title - The notification title.
 * @param {string} body - The notification body.
 * @param {Object} data - Additional data to include (optional).
 */
async function sendNotificationToTopic(topic, title, body, data = {}) {
  const message = {
    topic,
    notification: {
      title,
      body,
    },
    data, // Additional data (e.g., chatId, senderId)
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(
      `Successfully sent notification to topic '${topic}':`,
      response
    );
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}
/**
 * Subscribes a device token to a topic.
 * @param {string} token - The device's FCM token.
 * @param {string} topic - The topic name (e.g., "chat_12345").
 */
async function subscribeToTopic(token, topic) {
  try {
    await admin.messaging().subscribeToTopic(token, topic);
    console.log(`Token ${token} successfully subscribed to topic: ${topic}`);
  } catch (error) {
    console.error("Error subscribing to topic:", error);
  }
}

/**
 * Unsubscribes a user token from a topic.
 * @param {string} token - User's device FCM token.
 * @param {string} topic - Topic name (e.g., "chat_12345").
 */
async function unsubscribeFromTopic(token, topic) {
  try {
    await admin.messaging().unsubscribeFromTopic(token, topic);
    console.log(`Token ${token} unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error("Error unsubscribing from topic:", error);
  }
}

module.exports = {
  sendNotificationToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
};
