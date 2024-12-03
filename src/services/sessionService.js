const Session = require("../models/session");

/**
 * Service layer for sessions-related operations in the Express application.
 * @namespace Service.Sessions
 */

/**
 *  Creates a new session.
 * @memberof Service.Sessions
 * @method createSession
 * @async
 * @param {Object} [sessionData]                - Sessions's IP, and device type.
 * @returns {Promise<Session|null>}               A promise that resolves to the created session's information if successfully created, otherwise returns null.
 */

const createSession = async (sessionData) => {
  const {ip, deviceType, refreshToken, userId} = sessionData;
  return Session.create({ip, deviceType, refreshToken, userId});
};

/**
 *  Retrieves an existed session.
 * @memberof Service.Sessions
 * @method getSessionByIpAndDeviceType
 * @async
 * @param {String} [requestIp]                  - Sessions's needed Ip.
 * @param {String} [requestDeviceType]          - Sessions's needed deviceType.
 * @returns {Promise<Session|null>}              A promise that resolves to the session's information if found,, otherwise returns null.
 */

const getSessionByIpAndDeviceType = async (requestIp, requestDeviceType) => {
  return Session.findOne({
    where: {ip: requestIp, deviceType: requestDeviceType},
  });
};

/**
 *  Retrieves an existed session.
 * @memberof Service.Sessions
 * @method getSessionByUserId
 * @async
 * @param {String} [userId]                     - Sessions's user Id.
 * @returns {Promise<Session|null>}              A promise that resolves to the session's information if found,, otherwise returns null.
 */
const findSessionByUserIdAndDevice = async (userId, currentDeviceType) => {
  return Session.findOne({userId, deviceType: currentDeviceType});
};

/**
 *  Retrieves an existed session, and replace it with other session's data.
 * @memberof Service.Sessions
 * @method findSessionByUserIdAndUpdate
 * @async
 * @param {String} [userId]                     - Sessions's user Id.
 * @param {String} [currentDeviceType]           - Current sessions's device.
 * @param {Object} [newSession]                  - The new session to be updated.
 * @returns {Promise<Session|null>}              A promise that resolves to the session's information if found,, otherwise returns null.
 */
const findSessionByUserIdAndUpdate = async (
  userId,
  currentDeviceType,
  newSession
) => {
  return Session.findOneAndUpdate(
    {userId, deviceType: currentDeviceType},
    {
      $set: {
        ip: newSession.ip,
        deviceType: newSession.deviceType,
        refreshToken: newSession.refreshToken,
      },
    },
    {new: true}
  );
};

/**
 *  Deletes an existed session.
 * @memberof Service.Sessions
 * @method deleteSession
 * @async
 * @param {String} [sessionId]                  - Sessions's Id.
 * @returns {Promise<Session|null>}               A promise that resolves to the session's successful deletion if found,, otherwise returns null.
 */

const deleteSession = async (sessionId, currentDeviceType) => {
  return Session.deleteOne({
    _id: sessionId,
    deviceType: currentDeviceType,
  });
};

module.exports = {
  createSession,
  getSessionByIpAndDeviceType,
  findSessionByUserIdAndUpdate,
  findSessionByUserIdAndDevice,
  deleteSession,
};
