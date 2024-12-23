const userService = require("../services/userService");
const {
  createGroup,
  addMember,
  addMemberV2,
  leaveGroup,
  deleteGroup,
  removeParticipant,
} = require("./group/group");

const joinGroups = async (io, socket) => {
  const userData = await userService.getUserById(socket.user.id);
  if (userData && userData.groups) {
    userData.groups.forEach((group) => {
      socket.join(`group:${group}`);
    });
  }
};

const groupConnection = async (socket, io, connectedUsers) => {
  console.log("User connected to group namespace:", socket.id);

  console.log("User id connected:", socket.user.id);

  if (connectedUsers.get(socket.user.id))
    connectedUsers.get(socket.user.id).set("group", socket);
  else connectedUsers.set(socket.user.id, new Map([["group", socket]]));

  await joinGroups(io, socket);

  socket.on("creatingGroup", createGroup(io, socket, connectedUsers));
  socket.on("addingGroupMember", addMember(io, socket, connectedUsers));
  socket.on("addingGroupMemberV2", addMemberV2(io, socket, connectedUsers));
  socket.on("leavingGroup", leaveGroup(io, socket));
  socket.on("removingGroup", deleteGroup(io, socket, connectedUsers));
  socket.on(
    "removingParticipant",
    removeParticipant(io, socket, connectedUsers)
  );

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    connectedUsers.get(socket.user.id).delete("group");
  });
};

module.exports = groupConnection;
