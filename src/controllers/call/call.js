const catchAsync = require("../../utils/catchAsync");
const callService = require("../../services/callService");
const AppError = require("../../errors/appError");
const ioApp = require("../../ioApp");

module.exports.getCalls = catchAsync(async (req, res, next) => {
  const calls = await callService.getCallsOfUser(req.user.id);
  res.status(200).json({
    status: "success",
    calls,
  });
});

module.exports.getCallsOfChat = catchAsync(async (req, res, next) => {
  const {chatId} = req.params;
  const call = await callService.getOnGoingCallOfChat(chatId, req.user.id);
  res.status(200).json({
    status: "success",
    call,
  });
});

module.exports.joinCall = catchAsync(async (req, res, next) => {
  const {callId} = req.params;

  if (callId === "undefined")
    return next(new AppError("Call ID is required", 400));

  const call = await callService.getCallById(callId);
  if (!call) return next(new AppError("call not found", 404));

  let status;

  if (call.status === "ongoing") {
    status = "call joining";
    ioApp.ioServer
      .to(`${req.user.id}`)
      .emit("call:incomingCall", call, (data) => {
        if (data.status === "ready") {
          console.log("User Is Ready to receive following events");
        }
      });
  } else {
    status = "call ended";
  }

  res.status(200).json({
    status,
  });
});
