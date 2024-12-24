const callService = require("../../services/callService");
const {validateRequiredFields} = require("../utils/validatePayload");
const {
  selectRequiredCallObject,
  appendIceCandidates,
} = require("../utils/utilsFunc");
const firebaseUtils = require("../../utils/firebaseMessaging");
const handleSocketError = require("../../errors/handleSocketError");

const callLocks = new Map();

async function withLock(callId, task) {
  if (!callLocks.has(callId)) {
    callLocks.set(callId, Promise.resolve());
  }

  const previousPromise = callLocks.get(callId);

  const currentPromise = previousPromise.then(async () => {
    await task();
  });

  // Update the lock with the new promise
  callLocks.set(callId, currentPromise);

  // Clean up the lock after the task finishes
  currentPromise.finally(() => {
    if (callLocks.get(callId) === currentPromise) {
      callLocks.delete(callId);
    }
  });

  return currentPromise;
}

module.exports.createCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      validateRequiredFields(payload, "chatId");
      const call = await callService.createCall({
        callerId: socket.userId,
        chatId: payload.chatId,
      });

      call.callObj = null;
      call.senderId = socket.userId;
      socket.broadcast
        .to(`chat:${call.chatId._id}`)
        .emit("call:incomingCall", call, (data) => {
          if (data.status === "ready") {
            console.log("User Is Ready to receive following events");
          }
        });

      firebaseUtils.sendNotificationToTopic(
        `chat-${call.chatId._id}`,
        "A new Call is Incomming",
        ""
      );
      callBack({
        status: "ok",
        call,
      });
    } catch (err) {
      console.error(err);

      callBack({status: "error", message: err.message});
      handleSocketError(socket, err);
    }
  };
};
module.exports.sendOffer = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      validateRequiredFields(payload, "recieverId", "callId", "offer");

      const senderId = socket.userId;
      const {recieverId} = payload;

      if (recieverId == senderId)
        throw new Error("You cannot send offers to yourself");

      await withLock(payload.callId, async () => {
        const call = await callService.addOffer({
          senderId,
          recieverId,
          callId: payload.callId,
          offer: payload.offer,
        });
        call.senderId = socket.userId;
        call.recieverId = recieverId;
        await selectRequiredCallObject(call);

        if (call.participantsWhoRejected.has(recieverId) === false) {
          io.to(`${recieverId}`).emit("call:incomingOffer", call);
        }
        callBack({
          status: call.callBackStatus || "ok",
          call,
        });
      });
    } catch (err) {
      console.log(err.status, " should be sent");
      callBack({status: err.status || "error", message: err.message});
      handleSocketError(socket, err);
    }
  };
};

module.exports.answerCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      validateRequiredFields(payload, "recieverId", "callId", "answer");

      const senderId = socket.userId;
      const {recieverId} = payload;
      if (recieverId == senderId)
        throw new Error("You cannot send answers to yourself");

      await withLock(payload.callId, async () => {
        const call = await callService.setAnswer(
          senderId,
          recieverId,
          payload.callId,
          payload.answer
        );
        call.senderId = socket.userId;
        call.recieverId = recieverId;
        await selectRequiredCallObject(call);

        io.to(`${recieverId}`).emit("call:incomingAnswer", call);

        callBack({status: "ok", call});
      });
    } catch (err) {
      callBack({status: "error", message: err.message});
      handleSocketError(socket, err);
    }
  };
};

module.exports.rejectCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      await withLock(payload.callId, async () => {
        const call = await callService.rejectCall(
          payload.callId,
          socket.userId
        );

        if (call.status === "rejected") {
          if (call.participants.length > 0)
            io.to(`${call.participants[0].userId}`).emit(
              "call:endedCall",
              call
            );
        }

        callBack({status: "ok", call});
      });
    } catch (err) {
      callBack({status: "error", message: err.message});
      handleSocketError(socket, err);
    }
  };
};

module.exports.endCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      await withLock(payload.callId, async () => {
        const call = await callService.endCall(
          socket.userId,
          payload.callId,
          payload.status
        );
        call.senderId = socket.userId;
        if (call.status === "ended") {
          socket.broadcast
            .to(`chat:${call.chatId._id}`)
            .emit("call:endedCall", call);
        }

        callBack({status: "ok", call});
      });
    } catch (err) {
      callBack({status: "error", message: err.message});
      handleSocketError(socket, err);
    }
  };
};

module.exports.addIce = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;
      validateRequiredFields(payload, "recieverId", "callId", "IceCandidate");

      const senderId = socket.userId;
      const {recieverId} = payload;
      if (senderId == recieverId) {
        throw new Error("Can't send ice to yourself");
      }

      console.log("user sent ice: ", socket.userId);
      await withLock(payload.callId, async () => {
        const call = await callService.addIceCandidate(
          senderId,
          recieverId,
          payload.callId,
          payload.IceCandidate
        );

        call.senderId = socket.userId;
        call.recieverId = recieverId;
        await selectRequiredCallObject(call);

        if (
          call.answerIshere &&
          call.participantsWhoRejected.has(recieverId) === false
        ) {
          await appendIceCandidates(call, senderId);
          call.senderId = recieverId;
          call.recieverId = senderId;
          io.to(`${senderId}`).emit("call:addedICE", call);
          await appendIceCandidates(call, recieverId);
          call.senderId = senderId;
          call.recieverId = recieverId;
          io.to(`${recieverId}`).emit("call:addedICE", call);
          await call.clearIceCandidates(senderId, recieverId);
        }

        callBack({status: "ok", call});
      });
    } catch (err) {
      console.error(err);
      callBack({status: err.status || "error", message: err.message});
      handleSocketError(socket, err);
    }
  };
};

module.exports.sendIncomingCallForUser = async (io, call, senderId) => {
  callId = call._id.toString();
  await withLock(callId, async () => {
    console.log("sendIncomingCallForUser have the lock", callId);
    io.to(`${senderId}`).emit("call:incomingCall", call, (data) => {
      if (data.status === "ready") {
        console.log("User Is Ready to receive following events");
      }
      console.log("sendIncomingCallForUser LEAVE the lock");
    });
  });
};

module.exports.sendOfferForUser = async (io, call, senderId, recieverId) => {
  callId = call._id.toString();
  await withLock(callId, async () => {
    console.log("sending have the lock", callId);
    call.senderId = senderId;
    call.recieverId = recieverId;
    await selectRequiredCallObject(call);
    if (!call.participantsWhoRejected.has(call.recieverId)) {
      io.to(`${recieverId}`).emit("call:incomingOffer", call);
    }
    console.log("sending LEAVE  the lock");
  });
};
