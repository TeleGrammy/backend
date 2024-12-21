const userService = require("../services/userService");
const groupService = require("../services/groupService");
const chatService = require("../services/chatService");
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
  createCall,
  sendOffer,
  answerCall,
  endCall,
  rejectCall,
  addIce,
} = require("./calls/calls");

const joinChatsOfUsers = async (io, socket) => {
  // user join it is own room
  console.log("user join it is own room");
  socket.join(`${socket.userId}`);
  const user = await userService.getUserByID(socket.userId);
  const offsetOfUserIndvidualchat = user.userChats.get(socket.userId);
  await sendMissedEvents({
    io,
    userId: socket.userId,
    chatId: socket.userId,
    offset: offsetOfUserIndvidualchat,
  });
  await Promise.all(
    user.contacts.map(async (contact) => {
      console.log("user join room", `chat:${contact.chatId}`);
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

const joinGroupChats = async (io, socket) => {
  const userData = await userService.getUserById(socket.user.id);
  await Promise.all(
    userData.groups.map(async (group) => {
      const groupData = await groupService.findGroupById(group);

      if (groupData) socket.join(`chat:${groupData.chatId}`);
    })
  );
};

const joinChannelChats = async (io, socket) => {
  const userData = await userService.getUserById(socket.user.id);
  await Promise.all(
    userData.channels.map(async (channelId) => {
      const chatData = await chatService.getChatOfChannel(channelId);
      console.log(`Joining user:${socket.user.id} to chat:${chatData.id}`);

      if (chatData) socket.join(`chat:${chatData.id}`);
    })
  );
};

exports.onConnection = async (socket, io, connectedUsers) => {
  console.log("User connected:", socket.id);

  socket.userId = socket.user.id;
  console.log("User id connected:", socket.userId);

  if (connectedUsers.get(socket.userId))
    connectedUsers.get(socket.userId).set("chat", socket);
  else connectedUsers.set(socket.userId, new Map([["chat", socket]]));

  try {
    await joinChatsOfUsers(io, socket);
    await joinGroupChats(io, socket);
    await joinChannelChats(io, socket);
  } catch (error) {
    console.log(error);
  }
  socket.on("message:test", (payload, callback) => {
    console.log("Received 'message:test' event from client:", payload);
    if (callback) {
      callback({status: "success", message: "Voice note received"});
    }
  });

  socket.on("message:send", sendMessage({io, socket}));
  socket.on("message:update", updateMessage({io, socket}));
  socket.on("message:delete", deleteMessage({io, socket}));
  socket.on("message:seen", updateMessageViewres({io, socket}));
  socket.on("message:pin", pinMessage({io, socket}));
  socket.on("message:unpin", unpinMessage({io, socket}));

  socket.on("draft", updateDraftOfUserInChat({io, socket}));
  socket.on("event:ack", ackEvent({io, socket}));
  socket.on("typing", updateTypingStatus({io, socket}));

  socket.on("call:createCall", createCall({socket, io}));
  socket.on("call:offer", sendOffer({socket, io}));
  socket.on("call:answer", answerCall({socket, io}));
  socket.on("call:end", endCall({socket, io}));
  socket.on("call:reject", rejectCall({socket, io}));
  socket.on("call:addIce", addIce({socket, io}));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    connectedUsers.get(socket.userId).delete("chat");
  });
};
