const chatService = require("../../services/chatService");
const catchAsync = require("../../utils/catchAsync");

exports.getChat = catchAsync(async (req, res, next) => {
  const {sender, receiver} = req.query;

  if (!sender || !receiver) {
    return res
      .status(400)
      .json({error: "Both sender and receiver are required."});
  }

  const chat = await chatService.createOneToOneChat(sender, receiver);
  return res.status(200).json(chat);
});
