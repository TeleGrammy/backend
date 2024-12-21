const admin = require("firebase-admin");

const firebaseCredentials = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER,
  client_x509_cert_url: process.env.FIREBSAE_CLIENT_CERT,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

// Initialize Firebase Admin SDK
function initializeFirebase() {
  try {
    // Check if Firebase is already initialized
    if (!admin.apps.length) {
      // Load the service account key
      // Initialize Firebase Admin SDK
      admin.initializeApp({
        credential: admin.credential.cert(firebaseCredentials),
      });
      console.log("Firebase initialized successfully.");
    } else {
      console.log("Firebase already initialized.");
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}
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
  initializeFirebase,
  sendNotificationToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
};
