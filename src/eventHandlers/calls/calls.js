const callService = require("../../services/callService");

module.exports.sendCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      const call = await callService.createNewCall({
        caller: socket.userId,
        reciever: payload.reciever,
        chatId: payload.chatId,
      });

      // send out to all connected sockets
      io.to(`${call.reciever}`).emit("call:incomingCall", call);

      callBack({
        status: "ongoing",
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
      const call = await callService.answerCall(payload.callId);

      io.to(`${call.caller}`).emit("call:answeredCall", call);
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

      io.to(`${call.caller}`).emit("call:rejectedCall", payload.callId);
      callBack({status: "ok"});
    } catch (err) {
      callBack({status: "error", message: err.message});
    }
  };
};

module.exports.endCall = function ({socket, io}) {
  return async (payload, callBack) => {
    try {
      if (typeof callBack !== "function") return;

      const call = await callService.endCall(payload.callId);

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

      let call = await callService.getCallById(payload.callId);
      if (socket.userId === call.caller.toString()) {
        call = await callService.addCallerIce(payload.callId, payload.ice);
        if (call.status === "answered") {
          io.to(`${call.reciever}`).emit("call:recievedIce", call);
        }
      } else if (socket.userId === call.reciever.toString()) {
        call = await callService.addRecieverIce(payload.callId, payload.ice);
        io.to(`${call.senderId}`).emit("call:recievedIce", call);
      } else {
        throw new Error("User is not a participant in the call");
      }
      callBack({status: "ok", call});
    } catch (err) {
      callBack({status: "error", message: err.message});
    }
  };
};
