const Call = require("../models/call");
const User = require("../models/user");
const chatService = require("./chatService");

// Create a new call
module.exports.createCall = async ({chatId, callerId, offer}) => {
  let call = await Call.create({
    chatId,
    participants: [
      {
        userId: callerId,
      },
    ],
    callObj: {
      offer,
    },
  });
  // call the find method to populate the data using the middleware of the modael
  call = await Call.findById(call._id);
  return call;
};

module.exports.addParticipant = async (callId, participantId) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  call.participants.push({userId: participantId});
  await call.save();
  return call;
};

module.exports.setAnswer = async (userId, callId, answer) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");
  call.callObj.senderId = userId;
  call.callObj.answer = answer;
  call.callObj.participantICE = null;
  call.participants.push({userId});
  await call.save();
  return call;
};

module.exports.addIceCandidate = async (callId, userId, candidate) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  call.callObj.senderId = userId;
  call.callObj.participantICE = candidate;
  call.callObj.answer = null;
  await call.save();
  return call;
};

const removeUnwantedData = async (call) => {
  call.callObj = undefined;
  call.participants = undefined;
  return call;
};

module.exports.endCall = async (userId, callId, status) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  call.participants = call.participants.filter(
    (participant) => participant.userId.toString() !== userId
  );

  if (call.participants.length === 0) {
    call.status = status;
    if (status === "ended") call.endedAt = new Date();
    removeUnwantedData(call);
  }
  await call.save();
  return call;
};

module.exports.getCallById = async (callId) => {
  const call = await Call.findById(callId);

  if (!call) throw new Error("Call not found");
  return call;
};

module.exports.rejectCall = async (callId, userId) => {
  const call = await Call.findById(callId).populate("chatId");
  if (!call) throw new Error("Call not found");

  if (!call.participantsWhoRejected.has(userId.toString())) {
    call.participantsWhoRejected.set(userId.toString(), true);
  }

  if (
    call.participantsWhoRejected.size ===
    call.chatId.participants.length - 1
  ) {
    call.status = "rejected";
  }
  await call.save();
  return call;
};

module.exports.getCallsOfUser = async (userId) => {
  const user = await User.findById(userId).populate("groups");

  if (!user) throw new Error("User not found");

  const contactCalls = await Promise.all(
    user.contacts.map((contact) =>
      Call.find({chatId: contact.chatId}).select(
        "duration startedAt endedAt status chatId"
      )
    )
  );

  const groupCalls = await Promise.all(
    user.groups.map((group) =>
      Call.find({chatId: group.chatId}).select(
        "duration startedAt endedAt status chatId groupId"
      )
    )
  );

  const allCalls = [...contactCalls.flat(), ...groupCalls.flat()];

  return allCalls;
};

module.exports.getCallsOfChat = async (chatId, userId) => {
  await chatService.checkUserParticipant(chatId, userId);
  const calls = await Call.find({chatId}).select(
    "duration startedAt endedAt status chatId groupId"
  );
  return calls;
};
