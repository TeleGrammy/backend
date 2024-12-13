const Call = require("../models/call");
const Chat = require("../models/chat");

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

  call = await Call.findById(call._id);
  return call;
};

// Add a participant to a call
module.exports.addParticipant = async (callId, participantId) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  call.participants.push({userId: participantId});
  await call.save();
  return call;
};

// Update the call with an answer
module.exports.setAnswer = async (userId, callId, answer) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  call.callObj.answer = answer;
  call.participants.push({userId});
  await call.save();
  return call;
};

// Add ICE candidates for a participant
module.exports.addIceCandidate = async (callId, userId, candidate) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  if (!call.callObj.participantsICE.has(userId.toString())) {
    call.callObj.participantsICE.set(userId.toString(), []);
  }

  call.callObj.participantsICE.get(userId.toString()).push(candidate);
  await call.save();
  return call;
};

const removeUnwantedData = async (call) => {
  call.callObj = undefined;
  call.participants = undefined;
  return call;
};

// End a call
module.exports.endCall = async (userId, callId, status) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  // Remove the user from participants
  call.participants = call.participants.filter(
    (participant) => participant.userId.toString() !== userId
  );

  if (call.participants.length === 0) {
    call.status = status;
    if (status === "ended") call.endedAt = new Date();
    removeUnwantedData(call);
  }
  console.log(call);
  await call.save();
  return call;
};

// Fetch a call by ID
module.exports.getCallById = async (callId) => {
  const call = await Call.findById(callId);

  if (!call) throw new Error("Call not found");
  return call;
};

module.exports.updateStatus = async (callId, status) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");
  const chat = Chat.findById(call.cahtId);
  if (!chat.isChannel && !chat.isGroup) {
    call.status = status;
  }
  await call.save();
  return call;
};
