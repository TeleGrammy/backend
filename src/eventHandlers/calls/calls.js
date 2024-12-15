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

      if (call.callObj.offererIceCandidate.length > 0) {
        io.to(`${socket.userId}`).emit(
          "call:iceCandidate",
          call.callObj.offererIceCandidate
        );
      }
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

      // const call = await callService.updateStatus(payload.callId, "rejected");
      const call = await callService.rejectCall(payload.callId, socket.userId);

      if (call.status === "rejected") {
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

module.exports.addIce = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      const call = await callService.addIceCandidate(
        payload.callId,
        socket.userId,
        payload.IceCandidate
      );
      socket.broadcast
        .to(`chat:${call.chatId._id}`)
        .emit("call:addedICE", call);
      callBack({status: "ok", call});
    } catch (err) {
      callBack({status: "error", message: err.message});
    }
  };
};
