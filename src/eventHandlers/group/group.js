const mongoose = require("mongoose");
const AppError = require("../../errors/appError");
const groupService = require("../../services/groupService");
const chatService = require("../../services/chatService");
const userService = require("../../services/userService");
const messageService = require("../../services/messageService");
const handleSocketError = require("../../errors/handleSocketError");
const {logThenEmit} = require("../utils/utilsFunc");
const {phoneRegex} = require("../../utils/regexFormat");

const defaultMemberPermissions = {
  sendMessages: true,
  sendMedia: {
    photos: true,
    videos: true,
    files: true,
    music: true,
    voiceMessages: true,
    videoMessages: true,
    stickers: true,
    polls: true,
    embedLinks: true,
  },
  addUsers: true,
  pinMessages: true,
  changeChatInfo: true,
  downloadVideos: true,
  downloadVoiceMessages: true,
};

const defaultOwnerPermissions = {
  changeGroupInfo: true,
  deleteMessages: true,
  banUsers: true,
  addUsers: true,
  inviteUsersViaLink: true,
  pinMessages: true,
  manageStories: {
    postStories: true,
    editStories: true,
    deleteStories: true,
  },
  manageLiveStreams: true,
  addNewAdmins: true,
  remainAnonymous: true,
};

const createGroup = (io, socket, connectedUsers) => {
  return async (payload) => {
    try {
      const {name} = payload;
      const {image} = payload;
      const userId = socket.user.id;

      if (!name) throw new AppError("Group name is required", 400);

      const groupData = await groupService.createGroup(name, image, userId);

      let groupChat;

      try {
        groupChat = await chatService.createChat({
          isGroup: true,
          groupId: groupData._id,
        });

        groupData.chatId = groupChat._id;
        await groupData.save();
      } catch (err) {
        if (!groupChat) await groupService.deleteGroup({_id: groupData._id});
        handleSocketError(socket, err);
      }

      await chatService.addParticipant(groupChat._id, {userId});

      await userService.findByIdAndUpdate(userId, {
        $push: {groups: groupData._id},
      });

      socket.join(`group:${groupData._id}`);
      const userChatSocket = connectedUsers.get(userId).get("chat");
      if (userChatSocket) userChatSocket.join(`chat:${groupChat._id}`);

      socket.emit("group:created", {
        status: "success",
        message: "Group created successfully.",
        groupId: groupData._id,
        chatId: groupChat._id,
      });
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

const addMember = (io, socket, connectedUsers) => {
  return async (data) => {
    const {userIds} = data;
    const {groupId} = data;
    const participantId = socket.user.id;
    try {
      const group = await groupService.findGroupById(groupId);
      if (!group) throw new AppError("Group not found", 404);

      let participantData = group.members.find(
        (member) => member.memberId.toString() === participantId.toString()
      );

      const participantType = participantData ? "member" : "admin";
      participantData =
        participantData ??
        group.admins.find(
          (admin) => admin.adminId.toString() === participantId.toString()
        );

      if (!participantData)
        throw new AppError(
          "Unauthorized Access. The user who did the request is not a member of the group",
          401
        );

      const addUsersGroupPermission = group.groupPermissions.addUsers;

      if (
        (!addUsersGroupPermission && participantType === "member") ||
        (!addUsersGroupPermission &&
          participantType === "admin" &&
          !participantData.permissions.addUsers)
      )
        throw new AppError(
          `Insufficient Permissions. The ${participantType} does not have permission to add new users.`,
          403
        );

      if (
        group.admins.length + group.members.length + userIds.length >
        group.groupSizeLimit
      )
        throw new AppError(
          "You will exceed the the size limit of the group.",
          400
        );

      const groupChat = await chatService.getChatById(group.chatId);

      userIds.forEach((userId) => {
        let index = group.members.findIndex(
          (member) => member.memberId.toString() === userId.toString()
        );

        if (index === -1) {
          index = group.admins.findIndex(
            (admin) => admin.adminId.toString() === userId.toString()
          );
          if (index !== -1)
            throw new AppError("The user is already an admin", 400);
        } else {
          throw new AppError("The user is already member of the group", 400);
        }

        const newMember = {memberId: userId};

        index = group.leftMembers.findIndex(
          (member) => member.memberId.toString() === userId.toString()
        );
        if (index !== -1) {
          newMember.leftAt = group.leftMembers[index].leftAt;
          group.leftMembers.splice(index, 1);
        }

        groupChat.participants.push({userId});
        group.members.push(newMember);
      });

      await group.save();
      await groupChat.save();

      participantData = await userService.getUserById(participantId);
      const inviterName =
        participantData.screenName || participantData.username;

      await Promise.all(
        userIds.map(async (userId) => {
          const newMember = await userService.findByIdAndUpdate(
            userId,
            {
              $push: {groups: groupId},
            },
            {new: true}
          );

          const memberName = newMember.screenName || newMember.username;

          const userSocket = connectedUsers.get(userId);
          if (userSocket) {
            if (userSocket.get("group"))
              userSocket.get("group").join(`group:${groupId}`);
            if (userSocket.get("chat"))
              userSocket.get("chat").join(`chat:${group.chatId}`);
          }

          logThenEmit(
            participantId,
            "group:memberAdded",
            {
              chatId: group.chatId,
              memberId: userId,
              inviterId: participantId,
              memberName,
              inviterName,
            },
            io.to(`group:${groupId}`)
          );
        })
      );
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

const addMemberV2 = (io, socket, connectedUsers) => {
  return async (data, callback) => {
    const userIds = data.userIds || [];
    const phones = data.phones || [];
    const {groupId} = data;
    const participantId = socket.user.id;
    try {
      const group = await groupService.findGroupById(groupId);
      if (!group) throw new AppError("Group not found", 404);

      let participantData = group.members.find(
        (member) => member.memberId.toString() === participantId.toString()
      );

      const participantType = participantData ? "member" : "admin";
      participantData =
        participantData ??
        group.admins.find(
          (admin) => admin.adminId.toString() === participantId.toString()
        );

      if (!participantData)
        throw new AppError(
          "Unauthorized Access. The user who did the request is not a member of the group",
          401
        );

      const addUsersGroupPermission = group.groupPermissions.addUsers;

      if (
        (!addUsersGroupPermission && participantType === "member") ||
        (addUsersGroupPermission &&
          participantType === "member" &&
          !participantData.permissions.addUsers) ||
        (!addUsersGroupPermission &&
          participantType === "admin" &&
          !participantData.permissions.addUsers)
      )
        throw new AppError(
          `Insufficient Permissions. The ${participantType} does not have permission to add new users.`,
          403
        );

      const newUsers = userIds.concat(phones);

      if (
        group.admins.length + group.members.length + newUsers.length >
        group.groupSizeLimit
      )
        throw new AppError(
          "You will exceed the the size limit of the group.",
          400
        );

      const groupChat = await chatService.getChatById(group.chatId);

      const messages = [];
      const addedMembers = [];

      await Promise.all(
        newUsers.map(async (uuid) => {
          const filter = {};
          if (phoneRegex.test(uuid)) {
            filter.phone = uuid;
          } else if (mongoose.Types.ObjectId.isValid(uuid)) {
            filter._id = uuid;
          } else {
            messages.push(`Invalid user ID or phone number ${uuid}.`);
            return;
          }

          const user = await userService.findOne(filter);

          if (!user) {
            if (phoneRegex.test(uuid))
              messages.push(`Phone number ${uuid} not found.`);
            else messages.push(`User ID ${uuid} not found`);
            return;
          }

          if (user.whoCanAddMe === "Admins" && participantType === "member") {
            messages.push(
              `User with id or phone ${uuid} allows admins only to add him to groups `
            );
            return;
          }

          const userId = user._id;

          let index = group.members.findIndex(
            (member) => member.memberId.toString() === userId.toString()
          );

          if (index === -1) {
            index = group.admins.findIndex(
              (admin) => admin.adminId.toString() === userId.toString()
            );
            if (index !== -1) {
              messages.push(
                `User with id or phone ${uuid} is already admin of the group`
              );
              return;
            }
          } else {
            messages.push(
              `User with id or phone ${uuid} is already member of the group`
            );
            return;
          }

          let newMember;

          if (userId.toString() === group.ownerId.toString()) {
            newMember = {
              adminId: userId,
              joinedAt: Date.now(),
              customTitle: "Owner",
              superAdminId: userId,
              permissions: {
                postStories: false,
                editStories: false,
                deleteStories: false,
                remainAnonymous: false,
              },
            };
          } else {
            newMember = {memberId: userId};
          }

          index = group.leftMembers.findIndex(
            (member) => member.memberId.toString() === userId.toString()
          );
          if (index !== -1) {
            newMember.leftAt = group.leftMembers[index].leftAt;
            group.leftMembers.splice(index, 1);
          }

          groupChat.participants.push({userId});

          if (newMember.memberId) {
            group.members.push(newMember);
          } else {
            group.admins.push(newMember);
          }

          addedMembers.push(userId.toString());
        })
      );

      await group.save();
      await groupChat.save();

      participantData = await userService.getUserById(participantId);
      const inviterName =
        participantData.screenName || participantData.username;

      await Promise.all(
        addedMembers.map(async (userId) => {
          const newMember = await userService.findByIdAndUpdate(
            userId,
            {
              $push: {groups: groupId},
            },
            {new: true}
          );

          if (!newMember) return;

          const memberName = newMember.screenName || newMember.username;

          const memberData = {
            id: newMember._id,
            username: newMember.username,
            screenName: newMember.screenName,
            picture: newMember.picture,
            lastSeen: newMember.lastSeen,
          };

          if (userId.toString() === group.ownerId.toString())
            memberData.permissions = defaultOwnerPermissions;
          else memberData.permissions = defaultMemberPermissions;

          const userSocket = connectedUsers.get(userId);
          if (userSocket) {
            if (userSocket.get("group"))
              userSocket.get("group").join(`group:${groupId}`);
            if (userSocket.get("chat"))
              userSocket.get("chat").join(`chat:${group.chatId}`);
          }

          logThenEmit(
            participantId,
            "group:memberAdded",
            {
              chatId: group.chatId,
              memberId: userId,
              inviterId: participantId,
              memberName,
              inviterName,
              newMemberData: memberData,
            },
            io.to(`group:${groupId}`)
          );
        })
      );

      callback({
        status: addedMembers.length > 0 ? "success" : "error",
        errorMessages: messages,
      });
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

const leaveGroup = (io, socket) => {
  return async (data) => {
    const {groupId} = data;
    const userId = socket.user.id;
    try {
      const group = await groupService.findGroupById(groupId);

      if (!group) throw new AppError("Group not found.", 404);

      let index = group.members.findIndex(
        (member) => member.memberId.toString() === userId.toString()
      );

      if (index === -1) {
        index = group.admins.findIndex(
          (admin) => admin.adminId.toString() === userId.toString()
        );
        if (index === -1)
          throw new AppError("You are not a member of the group.", 400);
        else group.admins.splice(index, 1);
      } else {
        group.members.splice(index, 1);
      }

      const totalMembers = group.admins.length + group.members.length;

      if (totalMembers === 0) {
        await groupService.deleteGroup({_id: groupId});
        await chatService.removeChat({_id: group.chatId});
        await messageService.removeChatMessages({chatId: group.chatId});

        socket.emit("group:deleted", {
          chatId: group.chatId,
          message: "You left the group and the group was deleted.",
          groupId,
        });
      } else {
        group.leftMembers.push({memberId: userId, leftAt: Date.now()});
        await group.save();

        chatService.removeParticipant(group.chatId, userId);
        const memberName = await userService.getUserById(
          userId,
          "screenName username"
        );

        socket.emit("user:leftGroup", {
          status: "success",
          message: "You left the group.",
          groupId,
        });

        logThenEmit(
          userId,
          "group:memberLeft",
          {
            groupId,
            chatId: group.chatId,
            userId,
            memberName: memberName.screenName || memberName.username,
          },
          socket.to(`group:${groupId}`)
        );
      }

      await userService.findByIdAndUpdate(userId, {$pull: {groups: groupId}});
      socket.leave(`group:${groupId}`);
      socket.leave(`chat:${group.chatId}`);
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

const deleteGroup = (io, socket, connectedUsers) => {
  return async (data) => {
    const {groupId} = data;
    const userId = socket.user.id;

    try {
      const group = await groupService.findGroupById(groupId);

      if (!group) throw new AppError("Group not found.", 404);

      if (!group.ownerId.toString() === userId.toString())
        throw new AppError(
          "The user doesn't have the permission to delete the group",
          403
        );

      await groupService.deleteGroup({_id: groupId});
      await chatService.removeChat({_id: group.chatId});
      await messageService.removeChatMessages({chatId: group.chatId});
      await userService.updateMany(
        {groups: groupId},
        {$pull: {groups: groupId}}
      );

      const allMembers = group.members.concat(group.admins);

      logThenEmit(
        userId,
        "group:deleted",
        {
          chatId: group.chatId,
          message: "The group is deleted.",
          groupId,
        },
        io.to(`group:${groupId}`)
      );

      await Promise.all(
        allMembers.map(async (member) => {
          const userSocket = connectedUsers.get(
            member.memberId || member.adminId
          );
          if (userSocket) {
            if (userSocket.get("group"))
              userSocket.get("group").leave(`group:${groupId}`);
            if (userSocket.get("chat"))
              userSocket.get("chat").leave(`chat:${group.chatId}`);
          }
        })
      );
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

const removeParticipant = (io, socket, connectedUsers) => {
  return async (data) => {
    const {userId} = data;
    const {groupId} = data;
    const participantId = socket.user.id;

    try {
      const group = await groupService.findGroupById(groupId);
      if (!group) throw new AppError("Group not found.", 404);

      const admin = group.admins.find(
        (administrator) =>
          administrator.adminId.toString() === participantId.toString()
      );

      if (!admin || !admin.permissions.banUsers)
        throw new AppError(
          "Unauthorized Access.The user does not have the permission to add new admin.",
          403
        );
      let index = group.members.findIndex(
        (member) => member.memberId.toString() === userId.toString()
      );

      const type = index === -1 ? "admin" : "member";

      if (index === -1) {
        index = group.admins.findIndex(
          (member) => member.adminId.toString() === userId.toString()
        );
        if (index === -1)
          throw new AppError("User not found in the group.", 404);

        if (
          group.admins[index].superAdminId.toString() !== participantId &&
          participantId !== group.ownerId.toString()
        )
          throw new AppError("Insufficient Permission.", 403);
      }
      if (type === "admin") group.admins.splice(index, 1);
      else group.members.splice(index, 1);

      group.leftMembers.push({memberId: userId, leftAt: Date.now()});

      await group.save();
      chatService.removeParticipant(group.chatId, userId);

      const removedMemberData = await userService.findByIdAndUpdate(
        userId,
        {$pull: {groups: groupId}},
        {new: true}
      );

      const ParticipantName = await userService.getUserById(
        participantId,
        "screenName username"
      );

      const userSocket = connectedUsers.get(userId);
      if (userSocket) {
        if (userSocket.get("group")) {
          userSocket.get("group").leave(`group:${groupId}`);
          userSocket.get("group").emit("user:removedFromGroup", {
            groupId,
            removerId: participantId,
            removerName: ParticipantName.screenName || ParticipantName.username,
          });
        }
        if (userSocket.get("chat"))
          userSocket.get("chat").leave(`chat:${group.chatId}`);
      }
      logThenEmit(
        participantId,
        "group:memberRemoved",
        {
          chatId: group.chatId,
          groupId,
          removerId: participantId,
          memberId: userId,
          removerName: ParticipantName.screenName || ParticipantName.username,
          exMemberName:
            removedMemberData.screenName || removedMemberData.username,
        },
        io.to(`group:${groupId}`)
      );
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

module.exports = {
  createGroup,
  addMember,
  addMemberV2,
  leaveGroup,
  deleteGroup,
  removeParticipant,
};
