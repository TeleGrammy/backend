module.exports.updateTypingStatus = function ({io, socket}) {
  return async (payload) => {
    socket.broadcast
      .to(`chat:${payload.chatId}`)
      .emit("typing", {...payload, isTyping: payload.status});
  };
};
