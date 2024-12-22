const UserDevice = require("../models/userDevice");

/**
 * Save a new user device.
 * @param {Object} data - The device details.
 * @param {String} data.userId - The user's ID.
 * @param {String} data.deviceToken - The device token.
 * @returns {Promise<Object>} The saved user device.
 */
const saveDevice = async (userId, deviceToken) => {
  try {
    const newDevice = await UserDevice.create({userId, deviceToken});
    return newDevice;
  } catch (error) {
    throw new Error(`Failed to save device: ${error.message}`);
  }
};

/**
 * Get all devices for a user.
 * @param {String} userId - The user's ID.
 * @returns {Promise<Array>} List of devices for the user.
 */
const getDevicesByUser = async (userId) => {
  try {
    const devices = await UserDevice.find({userId});
    return devices;
  } catch (error) {
    throw new Error(`Failed to retrieve devices: ${error.message}`);
  }
};

/**
 * Remove a device by its token.
 * @param {String} deviceToken - The device token to remove.
 * @returns {Promise<Object|null>} The deleted device, or null if not found.
 */
const removeDeviceByToken = async (deviceToken) => {
  try {
    const deletedDevice = await UserDevice.findOneAndDelete({deviceToken});
    return deletedDevice;
  } catch (error) {
    throw new Error(`Failed to remove device: ${error.message}`);
  }
};

/**
 * Check if a device token exists.
 * @param {String} deviceToken - The device token to check.
 * @returns {Promise<Boolean>} Whether the device token exists.
 */
const isDeviceTokenExists = async (deviceToken, userId) => {
  try {
    const tokens = await UserDevice.find({deviceToken});
    let exist = false;
    tokens.forEach((token) => {
      console.log(token);
      if (token.userId.toString() === userId) {
        exist = true;
      }
    });
    return exist;
  } catch (error) {
    throw new Error(`Failed to check device token: ${error.message}`);
  }
};

module.exports = {
  saveDevice,
  getDevicesByUser,
  removeDeviceByToken,
  isDeviceTokenExists,
};
