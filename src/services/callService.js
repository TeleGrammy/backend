const mongoose = require("mongoose");

const Call = require("../models/call");
const User = require("../models/user");
const chatService = require("./chatService");
const {hasProperty} = require("../utils/utilitiesFunc");
// Create a new call
module.exports.createCall = async ({chatId, callerId}) => {
  let call = await Call.create({
    chatId,
    participants: [
      {
        userId: callerId,
      },
    ],
  });
  // call the find method to populate the data using the middleware of the model
  call = await Call.findById(call._id);
  return call;
};

const callObj = {
  offer: {},
  offererIceCandidates: [],
  answer: {},
  answererIceCandidates: [],
};
module.exports.addOffer = async ({senderId, recieverId, callId, offer}) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");
  if (
    hasProperty(call.callObjects, recieverId) &&
    hasProperty(call.callObjects[recieverId], senderId)
  ) {
    throw new Error(
      "You can't send an offer to this user. You need to send an answer object."
    );
  }
  if (call.callObjects[senderId] === undefined) call.callObjects[senderId] = {};
  if (call.callObjects[senderId][recieverId] === undefined) {
    call.callObjects[senderId][recieverId] = {...callObj};
  }

  call.callObjects[senderId][recieverId].offer = offer;
  await this.addParticipant({callId, participantId: senderId});

  call.markModified("callObjects");
  await call.save();
  return call;
};

module.exports.addParticipant = async ({callId, participantId}) => {
  let call = await Call.findOne({
    _id: callId,
    "participants.userId": participantId,
  });
  if (!call) {
    call = await Call.findByIdAndUpdate(
      callId,
      {$push: {participants: {userId: participantId}}},
      {new: true}
    );
    if (!call) throw new Error("User not found in the call");
  }

  return call;
};

module.exports.setAnswer = async (senderId, recieverId, callId, answer) => {
  const call = await Call.findById(callId);

  if (!call) throw new Error("Call not found");

  if (
    !hasProperty(call.callObjects, recieverId) ||
    !hasProperty(call.callObjects[recieverId], senderId)
  ) {
    throw new Error(
      "You can't send an answer to this user. You need to send an offer object."
    );
  }

  call.callObjects[recieverId][senderId].answer = answer;

  await this.addParticipant({callId, participantId: senderId});
  call.markModified("callObjects");
  await call.save();
  return call;
};

module.exports.addIceCandidate = async (
  senderId,
  recieverId,
  callId,
  candidate
) => {
  let call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  // these var for console log so  make sure to delete them

  let answerIshere = false;
  console.log(senderId, recieverId);
  if (call.callObjects[senderId] && call.callObjects[senderId][recieverId]) {
    call.callObjects[senderId][recieverId].offererIceCandidates.push(candidate);
    answerIshere = call.callObjects[senderId][recieverId].answer;
  } else if (
    call.callObjects[recieverId] &&
    call.callObjects[recieverId][senderId]
  ) {
    call.callObjects[recieverId][senderId].answererIceCandidates.push(
      candidate
    );
    answerIshere = call.callObjects[recieverId][senderId].answer;
  } else {
    const err = new Error(
      "You can't send ice to this call. make sure you have send or recieved the offer"
    );
    err.status = "offerExists";
  }

  call.markModified("callObjects");
  await call.save();

  call.answerIshere = answerIshere;

  return call;
};

module.exports.endCall = async (userId, callId, status) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  call.participants = call.participants.filter(
    (participant) => participant.userId.toString() !== userId
  );

  if (call.participants.length <= 1) {
    call.status = "ended";
    call.endedAt = new Date();
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
  const calls = await User.aggregate([
    {
      $match: {_id: new mongoose.Types.ObjectId(userId)}, // matches the user table for the userId
    },
    {
      $project: {contacts: 1, groups: 1, _id: 0}, // select `contacts` and `groups`
    },
    {
      $unwind: {path: "$contacts", preserveNullAndEmptyArrays: true},
    },
    {
      $lookup: {
        // get the calls of the contact.chatId from the calls table and name it as contactCalls
        from: "calls",
        let: {chatId: "$contacts.chatId"},
        pipeline: [
          {$match: {$expr: {$eq: ["$chatId", "$$chatId"]}}},
          {
            $addFields: {
              duration: {
                $cond: [
                  {
                    $and: [
                      {$ne: ["$endedAt", null]},
                      {$ne: ["$startedAt", null]},
                    ],
                  },
                  {$subtract: ["$endedAt", "$startedAt"]},
                  null,
                ],
              },
            },
          },
          {
            $project: {
              duration: 1,
              startedAt: 1,
              endedAt: 1,
              status: 1,
              chatId: 1,
            },
          },
        ],
        as: "contactCalls",
      },
    },
    {
      $unwind: {path: "$groups", preserveNullAndEmptyArrays: true},
    },
    {
      $lookup: {
        // get the calls of the user.groups.chatId from the calls table and name it as groupCalls
        from: "calls",
        let: {chatId: "$groups.chatId"},
        pipeline: [
          {$match: {$expr: {$eq: ["$chatId", "$$chatId"]}}},
          {
            $addFields: {
              duration: {
                $cond: [
                  {
                    $and: [
                      {$ne: ["$endedAt", null]},
                      {$ne: ["$startedAt", null]},
                    ],
                  },
                  {$subtract: ["$endedAt", "$startedAt"]},
                  null,
                ],
              },
            },
          },
          {
            $project: {
              duration: 1,
              startedAt: 1,
              endedAt: 1,
              status: 1,
              chatId: 1,
            },
          },
        ],
        as: "groupCalls", // Alias for group-based calls
      },
    },
    {
      // concat two type of calls to sort them
      $addFields: {
        allCalls: {$concatArrays: ["$contactCalls", "$groupCalls"]}, // Combine both arrays
      },
    },
    {
      $project: {allCalls: 1},
    },
    {
      $sort: {"allCalls.startedAt": -1}, // Sort by `startedAt`
    },
  ]);
  return calls[0].allCalls;
};

module.exports.getCallsOfChat = async (chatId, userId) => {
  await chatService.checkUserParticipant(chatId, userId);
  const calls = await Call.find({chatId}).select(
    "duration startedAt endedAt status chatId groupId"
  );
  return calls;
};
