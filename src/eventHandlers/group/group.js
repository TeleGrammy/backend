const AppError = require("../../errors/appError");
const groupService = require("../../services/groupService");
const chatService = require("../../services/chatService");
const handleSocketError = require("../../errors/handleSocketError");
const {logThenEmit} = require("../utils/utilsFunc");

const addMember = ({io, socket}) => {
  return async (data) => {
    const {userIds} = data;
    const {groupId} = data;
    const participantId = socket.user.id;
    try {
      const group = await groupService.findGroupById(groupId);
      if (!group) throw new AppError("Group not found", 404);

      let participantData = group.members.find((member) =>
        member.memberId.equals(participantId)
      );

      const participantType = participantData ? "member" : "admin";
      participantData =
        participantData ??
        group.admins.find((admin) => admin.adminId.equals(participantId));

      if (!participantData)
        throw new AppError(
          "Unauthorized Access. The user who did the request is not a member of the group",
          401
        );

      const addUsersGroupPermission = group.groupPermission.addUsers;

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

      userIds.forEach((userId) => {
        let index = group.members.findIndex((member) =>
          member.memberId.equals(userId)
        );

        if (index === -1) {
          index = group.admins.findIndex((admin) =>
            admin.adminId.equals(userId)
          );
          if (index !== -1)
            throw new AppError("The user is already an admin", 400);
        } else {
          throw new AppError("The user is already member of the group", 400);
        }

        const newMember = {memberId: userId};

        index = group.leftMembers.findIndex((member) =>
          member.memberId.equals(userId)
        );
        if (index !== -1) {
          newMember.leftAt = group.leftMembers[index].leftAt;
          group.leftMembers.splice(index, 1);
        }
        chatService.addParticipant(group.chatId, {userId});
        group.members.push(newMember);
        // TODO : should be updated to use the chat Id  after creation the chat  of type group
        logThenEmit(
          participantId,
          "group:newMember",
          {
            chatId: groupId,
            addedBy: participantId,
            newMember: newMember._doc,
          },
          socket.to(`group:${groupId}`)
        );
      });

      await group.save();
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

const leaveGroup = ({io, socket}) => {
  return async (data) => {
    const {groupId} = data;
    const userId = socket.user.id;
    try {
      const group = await groupService.findGroupById(groupId);

      if (!group) throw new AppError("Group not found.", 404);

      let index = group.members.findIndex((member) =>
        member.memberId.equals(userId)
      );

      if (index === -1) {
        index = group.admins.findIndex((admin) => admin.adminId.equals(userId));
        if (index === -1)
          throw new AppError("You are not a member of the group.", 400);
        else group.admins.splice(index, 1);
      } else {
        group.members.splice(index, 1);
      }

      const totalMembers = group.admins.length + group.members.length;

      if (totalMembers === 0) {
        await groupService.deleteGroup(groupId);
        await chatService.removeChat(group.chatId);
        logThenEmit(
          userId,
          "group:deleted",
          {
            chatId: groupId,
          },
          socket.to(`group:${groupId}`)
        );
      } else {
        await group.save();
        chatService.removeParticipant(group.chatId, userId);
        logThenEmit(
          userId,
          "group:memberLeaved",
          {
            chatId: groupId,
            memberId: userId,
          },
          socket.to(`group:${groupId}`)
        );
      }
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

const deleteGroup = ({io, socket}) => {
  return async (data) => {
    const {groupId} = data;
    const userId = socket.user.id;

    try {
      const group = await groupService.findGroupById(groupId);

      if (!group) throw new AppError("Group not found.", 404);

      if (!group.ownerId.equals(userId))
        throw new AppError(
          "The user doesn't have the permission to delete the group",
          403
        );

      await groupService.deleteGroup(groupId);
      await chatService.removeChat(group.chatId);
      logThenEmit(
        userId,
        "group:deleted",
        {
          chatId: groupId,
        },
        socket.to(`group:${groupId}`)
      );
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

const removeParticipant = ({io, socket}) => {
  return async (data) => {
    const {userId} = data;
    const {groupId} = data;
    const participantId = socket.user.id;

    try {
      const group = await groupService.findGroupById(groupId);
      if (!group) throw new AppError("Group not found.", 404);

      const admin = group.admins.find((administrator) =>
        administrator.adminId.equals(participantId)
      );

      if (!admin || !admin.permissions.banUsers)
        throw new AppError(
          "Unauthorized Access.The user does not have the permission to add new admin.",
          403
        );
      let index = group.members.findIndex((member) =>
        member.memberId.equals(userId)
      );

      const type = index === -1 ? "admin" : "member";

      if (index === -1) {
        index = group.admins.findIndex((member) =>
          member.adminId.equals(userId)
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

      await group.save();
      chatService.removeParticipant(group.chatId, userId);
      logThenEmit(
        userId,
        "group:memberRemoved",
        {
          chatId: groupId,
          removedBy: participantId,
          memberId: userId,
        },
        socket.to(`group:${groupId}`)
      );
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

module.exports = {
  addMember,
  leaveGroup,
  deleteGroup,
  removeParticipant,
};
