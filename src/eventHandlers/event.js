const userService = require("../services/userService");
const eventService = require("../services/eventService");
const messageService = require("../services/messageService");
const {logThenEmit} = require("./utils/utilsFunc");

module.exports.ackEvent = function ({io, socket}) {
  return async (payload) => {
    try {
      await userService.ackEvent(
        socket.userId,
        payload.chatId,
        payload.eventIndex
      );
      const event = await eventService.getEventsByIndex(
        payload.chatId,
        payload.eventIndex
      );
      if (event && event.name === "message:sent") {
        const message = await messageService.updateMessageRecivers(
          event.payload.chatId,
          event.payload._id,
          socket.userId
        );

        logThenEmit(
          socket.userId,
          "message:delivered",
          {
            chatId: socket.userId,
            message,
          },
          io.to(`${event.payload.senderId}`)
        );
      }
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
