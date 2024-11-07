const userService = require("../services/userService");
const eventService = require("../services/eventService");

module.exports.ackEvent = function ({io, socket}) {
  return async (payload) => {
    try {
      await userService.ackEvent(
        socket.userId,
        payload.chatId,
        payload.eventIndex
      );
    } catch (err) {
      console.log(err);
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.sendMissedEvents = async ({io, userId, chatId, offset}) => {
  if (offset === undefined) offset = 0;
  const missedEvents = await eventService.getEvents(chatId, offset);
  // console.log(missedEvents);
  missedEvents.forEach((event) => {
    io.to(`${userId}`).emit(event.name, {
      ...event.payload,
      eventIndex: event.index,
    });
  });
};
