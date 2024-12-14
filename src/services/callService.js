const Call = require("../models/call");

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
  call.callObj.senderId = userId;
  call.callObj.answer = answer;
  call.callObj.participantICE = null;
  call.participants.push({userId});
  await call.save();
  return call;
};

// Add ICE candidates for a participant
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
  await call.save();
  return call;
};

// Fetch a call by ID
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
