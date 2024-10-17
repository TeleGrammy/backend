const User = require("../models/user");

/**
 * Service layer for user-related operations in the Express application.
 * @namespace Service.Users
 */

/**
 * Retrieves a user by email, username, or phone.
 * @memberof Service.Users
 * @method getUserByUUID
 * @async
 * @param {String} UUID - User's email, username, or phone.
 * @param {Object} [selectionFilter={}] - The fields needed to select from the user object. Defaults to an empty object.
 * @returns {Promise<User|null>} A promise that resolves to the user object if found, otherwise returns null.
 */
const getUserByUUID = async (UUID, selectionFilter = {}) => {
  const user = await User.findOne({
    $or: [{email: UUID}, {username: UUID}, {phone: UUID}],
  }).select(selectionFilter);

  return user;
};

/**
 * Retrieves user's basic information by email, username, or phone.
 * @memberof Service.Users
 * @method getUserBasicInfoByUUID
 * @async
 * @param {String} UUID - User's email, username, or phone.
 * @returns {Promise<User|null>} A promise that resolves to basic user information if found, otherwise returns null.
 */
const getUserBasicInfoByUUID = async (UUID) => {
  const userBasicInfo = {
    _id: 1,
    username: 1,
    email: 1,
    phone: 1,
    status: 1,
    registrationDate: 1,
  };

  return await getUserByUUID(UUID, userBasicInfo);
};

/**
 * Retrieves the user's password.
 * @memberof Service.Users
 * @method getUserPassword
 * @async
 * @param {String} id - User's Id.
 * @returns {Promise<User|null>} A promise that resolves to the user's hashed password if found,, otherwise returns null.
 */

const getUserPassword = async (id) => {
  const user = await User.findById(id).select("password");

  return user ? user.password : null;
};

module.exports = {
  getUserByUUID,
  getUserBasicInfoByUUID,
  getUserPassword,
};
