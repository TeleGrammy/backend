const User = require("../models/user");

const AppError = require("../errors/appError");

/**
 * Service layer for user-related operations in the Express application.
 * @namespace Service.Users
 */

/**
 * Retrieves a user by email, username, or phone.
 * @memberof Service.Users
 * @method getUserByUUID
 * @async
 * @param {String} [UUID]               - User's email, username, or phone.
 * @param {Object} [selectionFilter={}] - The fields needed to select from the user object. Defaults to an empty object.
 * @returns {Promise<User|null>}          A promise that resolves to the user object if found, otherwise returns null.
 */
const getUserByUUID = async (UUID, selectionFilter = {}) => {
  if (!UUID) {
    throw new AppError("An UUID is required", 500);
  }

  return await User.findOne({
    $or: [{email: UUID}, {username: UUID}, {phone: UUID}],
  }).select(selectionFilter);
};

/**
 * Retrieves a user by email, username, or phone.
 * @memberof Service.Users
 * @method getUserByContactInfo
 * @async
 * @param {String} [email]              - User's email.
 * @param {String} [username]           - User's username.
 * @param {String} [phone]              - User's phone number.
 * @param {Object} [selectionFilter={}] - The fields needed to select from the user object. Defaults to an empty object.
 * @returns {Promise<User|null>}          A promise that resolves to the user object if found, otherwise returns null.
 */
const getUserByContactInfo = async (
  email,
  username,
  phone,
  selectionFilter = {}
) => {
  return User.findOne({
    $or: [{email}, {username}, {phone}],
  }).select(selectionFilter);
};

/**
 * Retrieves user's basic information by email, username, or phone.
 * @memberof Service.Users
 * @method getUserBasicInfoByUUID
 * @async
 * @param {String} [UUID]        - User's email, username, or phone.
 * @returns {Promise<User|null>} A promise that resolves to basic user information if found, otherwise returns null.
 */
const getUserBasicInfoByUUID = async (UUID) => {
  if (!UUID) {
    throw new AppError("An UUID is required", 500);
  }

  const userBasicInfo = {
    _id: 1,
    username: 1,
    email: 1,
    phone: 1,
    sessions: 1,
    status: 1,
    password: 1,
    registrationDate: 1,
    loggedOutFromAllDevicesAt: 1,
  };

  return getUserByUUID(UUID, userBasicInfo);
};

/**
 * Retrieves the user's password.
 * @memberof Service.Users
 * @method getUserPasswordById
 * @async
 * @param {String} [id]          - User's Id.
 * @returns {Promise<User|null>} A promise that resolves to the user's hashed password if found,, otherwise returns null.
 */

const getUserPasswordById = async (id) => {
  if (!id) {
    throw new AppError("User Id is required", 500);
  }

  try {
    const user = await User.findById(id).select("password");
    return user ? user.password : null;
  } catch (error) {
    throw new AppError("Could not retrieve the user's password", 404);
  }
};

/**
 *  Retrieves the user's id by his UUID.
 * @memberof Service.Users
 * @method getUserId
 * @async
 * @param {String}              UUID - User's email, username, or phone.
 * @returns {Promise<User|null>} A promise that resolves to the user's id if found,, otherwise returns null.
 */

const getUserId = async (UUID) => {
  if (!UUID) {
    throw new AppError("A UUID is required", 500);
  }

  try {
    const user = await getUserByUUID(UUID);
    return user ? user.id : null;
  } catch (error) {
    throw new AppError("Could not retrieve the user's Id", 404);
  }
};

/**
 *  Retrieves the user by his id.
 * @memberof Service.Users
 * @method getUserByEmail
 * @async
 * @param {String} [email]       - User's email.
 * @returns {Promise<User|null>} A promise that resolves to the user's information if found,, otherwise returns null.
 */

const getUserByEmail = async (email) => {
  if (!email) {
    throw new AppError("An email is required", 500);
  }

  try {
    return await User.findOne({email});
  } catch (error) {
    throw new AppError("Could not retrieve the user's information", 404);
  }
};

/**
 *  Creates the user giving the data he/she needs.
 * @memberof Service.Users
 * @method createUser
 * @async
 * @param {Object} [userData]    - User's data.
 * @returns {Promise<User|null>} A promise that resolves to the user's information if found,, otherwise returns null.
 */

const createUser = async (userData) => {
  const {
    username,
    email,
    phone,
    password,
    passwordConfirm,
    picture,
    id,
    accessToken,
    refreshToken,
    isGoogleUser,
    isGitHubUser,
  } = userData;

  return await User.create({
    username,
    email,
    phone,
    password,
    passwordConfirm,
    picture,
    accessToken,
    refreshToken,
    ...(isGoogleUser ? {googleId: id} : {}),
    ...(isGitHubUser ? {gitHubId: id} : {}),
  });
};

const findOne = async (filter) => {
  return await User.findOne(filter);
};

const findOneAndUpdate = async (filter, updateData, options) => {
  return await User.findOneAndUpdate(filter, updateData, options);
};

const getUserByID = async (ID) => {
  return User.findById(ID);
};

const findByIdAndUpdate = async (id, updateData, options) => {
  return User.findByIdAndUpdate(id, updateData, options);
};
const getUserById = async (id, select = "") => {
  return User.findById(id).select(select);
};
module.exports = {
  getUserByUUID,
  getUserBasicInfoByUUID,
  getUserByContactInfo,
  getUserByEmail,
  getUserPasswordById,
  getUserId,
  getUserByID,
  createUser,
  findOne,
  findOneAndUpdate,
  findByIdAndUpdate,
  getUserById,
};
