const userService = require("../services/userService");
const {
  sendMessage,
  updateMessageViewres,
  updateMessage,
  deleteMessage,

  updateDraftOfUserInChat,
  pinMessage,
  unpinMessage,
} = require("./chat/message");
const {ackEvent, sendMissedEvents} = require("./event");
const {updateTypingStatus} = require("./chat/typing");
const {
  addMember,
  leaveGroup,
  deleteGroup,
  removeParticipant,
} = require("./group/group");

const joinChatsOfUsers = async (io, socket) => {
  // user join it is own room
  socket.join(`${socket.userId}`);
  // TODO : user should also handle the offset of the events sent for him only

  const user = await userService.getUserByID(socket.userId);
  await Promise.all(
    user.contacts.map(async (contact) => {
      socket.join(`chat:${contact.chatId}`);
      const draft = user.userDrafts.get(contact.chatId);
      if (draft) {
        io.to(`${socket.userId}`).emit("draft", {
          chatId: contact.chatId,
          draft,
        });
      }
      const offset = user.userChats.get(contact.chatId);

      await sendMissedEvents({
        io,
        userId: socket.userId,
        chatId: contact.chatId,
        offset,
      });
    })
  );
};

exports.onConnection = async (socket, io) => {
  console.log("User connected:", socket.id);

  socket.userId = socket.user.id;
  console.log("User id connected:", socket.userId);

  await joinChatsOfUsers(io, socket);

  socket.on("message:send", sendMessage({io, socket}));
  socket.on("message:update", updateMessage({io, socket}));
  socket.on("message:delete", deleteMessage({io, socket}));
  socket.on("message:seen", updateMessageViewres({io, socket}));
  socket.on("message:pin", pinMessage({io, socket}));
  socket.on("message:unpin", unpinMessage({io, socket}));

  socket.on("draft", updateDraftOfUserInChat({io, socket}));
  socket.on("event:ack", ackEvent({io, socket}));
  socket.on("typing", updateTypingStatus({io, socket}));

  socket.on("message", (msg) => {
    console.log("Message from Client:", msg);
  });
  socket.on("message:send_voicenote", (payload, callback) => {
    console.log(
      "Received 'message:send_voicenote' event from client:",
      payload
    );

    // Acknowledge receipt if needed
    if (callback) {
      callback({status: "success", message: "Voice note received"});
    }
  });

  socket.on("addingGroupMember", addMember({io, socket}));
  socket.on("leavingGroup", leaveGroup({io, socket}));
  socket.on("removingGroup", deleteGroup({io, socket}));
  socket.on("removingParticipant", removeParticipant({io, socket}));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};
