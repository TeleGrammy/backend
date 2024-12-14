const groupService = require("../../services/groupService");

const canSendMessage = async (socket, payload, callback) => {
  const group = await groupService.findGroup({
    chatId: payload.chatId,
  });

  if (!group) return true;

  const user = group.members
    .concat(group.admins)
    .find(
      (member) =>
        member.memberId?.toString() === socket.userId?.toString() ||
        member.adminId?.toString() === socket.userId?.toString()
    );

  if (!user) {
    callback({
      status: "error",
      message: "You are not a member of this group",
    });
    return false;
  }

  const type = user.memberId ? "member" : "admin";
  const {groupPermissions} = group;
  const userPermissions = user.permissions;

  const messageTypeMapping = {
    text: groupPermissions.sendTextMessages && userPermissions?.sendMessages,
    image:
      groupPermissions.sendMedia.photos && userPermissions.sendMedia?.photos,
    video:
      groupPermissions.sendMedia.videos && userPermissions.sendMedia?.videos,
    file: groupPermissions.sendMedia.files && userPermissions.sendMedia?.files,
    sticker:
      groupPermissions.sendMedia.stickers &&
      userPermissions.sendMedia?.stickers,
    voice_note:
      groupPermissions.sendMedia.voiceMessages &&
      userPermissions.sendMedia?.voiceMessages,
  };

  if (type === "member" && messageTypeMapping[payload.messageType] === false) {
    callback({
      status: "error",
      message: "You are not allowed to send text messages in this group",
    });
    return false;
  }
  return true;
};

const canDeleteMessage = async (socket, senderId, group) => {
  const participantId = socket.userId;

  const user = group.members
    .concat(group.admins)
    .find(
      (member) =>
        member.memberId?.toString() === participantId?.toString() ||
        member.adminId?.toString() === participantId?.toString()
    );

  if (!user) {
    socket.emit("error", {
      status: "error",
      message: "You are not a member of this group",
    });
    return false;
  }

  const type = user.memberId ? "member" : "admin";

  if (
    participantId === group.ownerId.toString() ||
    participantId === senderId.toString() ||
    (type === "admin" && user.permissions.deleteMessages)
  )
    return true;

  socket.emit("error", {
    status: "error",
    message: "You are not allowed to delete this message",
  });

  return false;
};

const canPinMessage = async (socket, group) => {
  const index = group.admins.findIndex(
    (admin) => admin.adminId.toString() === socket.userId
  );
  if (index === -1) {
    socket.emit("error", {status: "fail", message: "You are not an admin"});
    return false;
  }

  if (!group.admins[index].permissions.pinMessages) {
    socket.emit("error", {
      status: "fail",
      message: "You don't have permission to pin a message",
    });
    return false;
  }
  return true;
};

module.exports = {canSendMessage, canDeleteMessage, canPinMessage};
