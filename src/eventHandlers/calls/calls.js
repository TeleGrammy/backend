const callService = require("../../services/callService");

module.exports.createCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      const call = await callService.createCall({
        callerId: socket.userId,
        chatId: payload.chatId,
      });

      callBack({
        status: "ok",
        call,
      });
    } catch (err) {
      callBack({status: "error", message: err.message});
    }
  };
};

module.exports.sendCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      const call = await callService.addOffer({
        callerId: socket.userId,
        callId: payload.callId,
        offer: payload.offer,
      });

      socket.broadcast
        .to(`chat:${call.chatId._id}`)
        .emit("call:incomingCall", call);

      callBack({
        status: "ok",
        call,
      });
    } catch (err) {
      callBack({status: "error", message: err.message});
    }
  };
};

module.exports.answerCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      const call = await callService.setAnswer(
        socket.userId,
        payload.callId,
        payload.answer
      );

      socket.broadcast
        .to(`chat:${call.chatId._id}`)
        .emit("call:answeredCall", call);

      callBack({status: "ok", call});
    } catch (err) {
      callBack({status: "error", message: err.message});
    }
  };
};

module.exports.rejectCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      const call = await callService.rejectCall(payload.callId, socket.userId);

      if (call.status === "rejected") {
        if (call.participants.length > 0)
          io.to(`${call.participants[0].userId}`).emit("call:endedCall", call);
      }

      callBack({status: "ok", call});
    } catch (err) {
      callBack({status: "error", message: err.message});
    }
  };
};

module.exports.endCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      const call = await callService.endCall(
        socket.userId,
        payload.callId,
        payload.status
      );

      socket.broadcast
        .to(`chat:${call.chatId._id}`)
        .emit("call:endedCall", call);
      callBack({status: "ok", call});
    } catch (err) {
      callBack({status: "error", message: err.message});
    }
  };
};

const callLocks = new Map();
module.exports.addIce = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;
      console.log("user sent ice: ", socket.userId);
      if (!callLocks.has(payload.callId)) {
        callLocks.set(payload.callId, Promise.resolve());
      }

      // chain the current operation onto the existing queue
      const previousPromise = callLocks.get(payload.callId);
      const currentPromise = previousPromise.then(async () => {
        console.log("have the lock of", payload.callId);
        const call = await callService.addIceCandidate(
          payload.callId,
          socket.userId,
          payload.IceCandidate
        );

        if (call.callObj.answer !== null) {
          const {senderId, recieverId} = call.callObj;

          io.to(`${senderId}`).emit("call:addedICE", call);
          io.to(`${recieverId}`).emit("call:addedICE", call);

          await call.clearIceCandidates(socket.userId);
        }

        callBack({status: "ok", call});
      });

      // update the lock with the new promise
      callLocks.set(payload.callId, currentPromise);

      // ensure we clean up after the current task finishes
      currentPromise.finally(() => {
        if (callLocks.get(payload.callId) === currentPromise) {
          callLocks.delete(payload.callId);
        }
        console.log("leave the lock of", payload.callId);
      });

      // wait for the current task to complete before resolving
      await currentPromise;
    } catch (err) {
      console.error(err);
      callBack({status: "error", message: err.message});
    }
  };
};
