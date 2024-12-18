const mongoose = require("mongoose");

const Call = require("../models/call");
const User = require("../models/user");
const chatService = require("./chatService");
// Create a new call
module.exports.createCall = async ({chatId, callerId}) => {
  let call = await Call.create({
    chatId,
    participants: [
      {
        userId: callerId,
      },
    ],
    callObj: {
      senderId: callerId,
    },
  });
  // call the find method to populate the data using the middleware of the model
  call = await Call.findById(call._id);
  return call;
};
module.exports.addOffer = async ({callId, callerId, offer}) => {
  const call = await Call.findByIdAndUpdate(
    callId,
    {
      callObj: {
        offer,
        senderId: callerId,
      },
    },
    {
      new: true,
    }
  );
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
  call.callObj.recieverId = userId;
  call.callObj.answer = answer;
  call.participants.push({userId});
  await call.save();
  return call;
};

module.exports.addIceCandidate = async (callId, userId, candidate) => {
  if (!candidate) return;

  let call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");
  const update =
    call.callObj.senderId.toString() === userId
      ? {$push: {"callObj.offererIceCandidate": candidate}}
      : {$push: {"callObj.answererIceCandiate": candidate}};

  call = await Call.findByIdAndUpdate(callId, update, {
    new: true,
    upsert: true,
  });
  console.log(call.callObj.offererIceCandidate.length, "offererIceCandidate");
  console.log(call.callObj.answererIceCandiate.length, "answererIceCandidate");

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
    removeUnwantedData(call);
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
