const Call = require("../models/call");
const AppError = require("../errors/appError");

module.exports.createNewCall = async (callData) => {
  const {caller, chatId, reciever} = callData;
  const call = await Call.create({caller, chatId, reciever});
  return call;
};

module.exports.getCallById = async (callId) => {
  const call = await Call.findById(callId);
  if (!call) {
    throw new AppError("Call not found", 404);
  }
  return call;
};

module.exports.updatestatus = async (callId, status) => {
  const call = await Call.findByIdAndUpdate(
    callId,
    {
      status,
    },
    {new: true}
  );
  if (!call) {
    throw new AppError("Call not found", 404);
  }
  return call;
};

module.exports.endCall = async (callId) => {
  const call = await Call.findByIdAndUpdate(
    callId,
    {
      endTime: Date.now(),
      status: "ended",
    },
    {new: true}
  );
  if (!call) {
    throw new AppError("Call not found", 404);
  }
  return call;
};

module.exports.answerCall = async (callId) => {
  const call = await Call.findByIdAndUpdate(
    callId,
    {
      status: "answered",
      startTime: Date.now(),
    },
    {new: true}
  );
  if (!call) {
    throw new AppError("Call not found", 404);
  }
  return call;
};

module.exports.addCallerIce = async (callId, ice) => {
  const call = await Call.findByIdAndUpdate(
    callId,
    {
      callerIce: ice,
    },
    {new: true}
  );
  if (!call) {
    throw new AppError("Call not found", 404);
  }
  return call;
};

module.exports.addRecieverIce = async (callId, ice) => {
  const call = await Call.findByIdAndUpdate(
    callId,
    {
      recieverIce: ice,
    },
    {new: true}
  );
  if (!call) {
    throw new AppError("Call not found", 404);
  }
  return call;
};
