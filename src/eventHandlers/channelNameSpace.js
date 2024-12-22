const userService = require("../services/userService");
const {
  deleteChannel,
  removeParticipant,
  addMember,
  promoteSubscriber,
  demoteAdmin,
} = require("./channel/channel");

const joinChannels = async (io, socket) => {
  const userData = await userService.getUserById(socket.user.id);

  if (userData && userData.channels) {
    userData.channels.forEach((channel) => {
      console.log(`Joining user:${socket.user.id} to channel:${channel}`);
      socket.join(`channel:${channel}`);
    });
  }
};

const channelConnection = async (socket, io, connectedUsers) => {
  console.log("User connected to channel namespace:", socket.id);

  console.log("User id connected:", socket.user.id);

  if (connectedUsers.get(socket.user.id))
    connectedUsers.get(socket.user.id).set("channel", socket);
  else connectedUsers.set(socket.user.id, new Map([["channel", socket]]));

  await joinChannels(io, socket);

  socket.on("removingChannel", deleteChannel(io, socket, connectedUsers));
  socket.on(
    "removingChannelParticipant",
    removeParticipant(io, socket, connectedUsers)
  );
  socket.on("addingChannelSubscriper", addMember(io, socket, connectedUsers));
  socket.on("promoteSubscriper", promoteSubscriber(io, socket, connectedUsers));
  socket.on("demoteAdmin", demoteAdmin(io, socket, connectedUsers));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    connectedUsers.get(socket.user.id).delete("channel");
  });
};

module.exports = channelConnection;
