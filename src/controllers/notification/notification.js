const catchAsync = require("../../utils/catchAsync");
const userDeviceService = require("../../services/userDeviceService");
const firebaseUtils = require("../../utils/firebaseMessaging");
const chatService = require("../../services/chatService");
const AppError = require("../../errors/appError");

exports.muteNotification = catchAsync(async (req, res, next) => {
  const {userId} = req.user;
  const {chatId} = req.body;

  const chat = await chatService.getBasicChatById(chatId);
  if (!chat) {
    throw new AppError("This Chat is not found", 404);
  }
  const userTokens = await userDeviceService.getDevicesByUser(userId);
  if (userTokens) {
    userTokens.forEach(async (token) => {
      firebaseUtils.unsubscribeFromTopic(token, `chat-${chatId}`);
    });
  }
  res.status(200).send({
    message: `Chat: ${chatId} has been muted`,
  });
});

exports.unmuteNotification = catchAsync(async (req, res, next) => {
  const {userId} = req.user;
  const {chatId} = req.body;

  const chat = await chatService.getBasicChatById(chatId);
  if (!chat) {
    throw new AppError("This Chat is not found", 404);
  }
  const userTokens = await userDeviceService.getDevicesByUser(userId);
  if (userTokens) {
    userTokens.forEach(async (token) => {
      firebaseUtils.subscribeToTopic(token, `chat-${chatId}`);
    });
  }
  res.status(200).send({
    message: `Chat: ${chatId} has been muted`,
  });
});
