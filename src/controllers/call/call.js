const catchAsync = require("../../utils/catchAsync");
const callService = require("../../services/callService");

module.exports.getCalls = catchAsync(async (req, res, next) => {
  const calls = await callService.getCallsOfUser(req.user.id);
  res.status(200).json({
    status: "success",
    calls,
  });
});

module.exports.getCallsOfChat = catchAsync(async (req, res, next) => {
  const {chatId} = req.params;
  const calls = await callService.getCallsOfChat(chatId, req.user.id);
  res.status(200).json({
    status: "success",
    calls,
  });
});
