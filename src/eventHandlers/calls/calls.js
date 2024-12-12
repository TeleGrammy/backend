const callService = require("../../services/callService");

module.exports.sendCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      const call = await callService.createCall({
        callerId: socket.userId,
        chatId: payload.chatId,
        offer: payload.offer,
      });

      // send out to all connected sockets
      socket.broadcast
        .to(`chat:${call.chatId}`)
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
        .to(`chat:${call.chatId}`)
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

      const call = await callService.updateStatus(payload.callId, "rejected");

      io.to(`chat:${call.chatId}`).emit("call:rejectedCall", call);
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

      io.to(`chat:${call.chatId}`).emit("call:endedCall", call);
      callBack({status: "ok", call});
    } catch (err) {
      callBack({status: "error", message: err.message});
    }
  };
};

module.exports.addIce = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      const call = await callService.addIceCandidate(
        payload.callId,
        socket.userId,
        payload.IceCandidate
      );
      socket.broadcast.to(`chat:${call.chatId}`).emit("call:addedICE", call);
      callBack({status: "ok", call});
    } catch (err) {
      callBack({status: "error", message: err.message});
    }
  };
};
