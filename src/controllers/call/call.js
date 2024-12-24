const catchAsync = require("../../utils/catchAsync");
const callService = require("../../services/callService");
const AppError = require("../../errors/appError");
const ioApp = require("../../ioApp");
const {
  sendIncomingCallForUser,
  sendOfferForUser,
} = require("../../eventHandlers/calls/calls");

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

    await sendIncomingCallForUser(ioApp.ioServer, call, req.user.id);

    await new Promise((resolve) => setTimeout(resolve, 200));

    for (const [outerKey, innerObject] of Object.entries(call.callObjects)) {
      for (const [innerKey, data] of Object.entries(innerObject)) {
        console.log(outerKey, innerKey);
        if (req.user.id === innerKey) {
          await sendOfferForUser(ioApp.ioServer, call, outerKey, innerKey);
        }
      }
    }
  } else {
    status = "call ended";
  }

  res.status(200).json({
    status,
  });
});
