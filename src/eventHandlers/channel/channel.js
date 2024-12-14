const AppError = require("../../errors/appError");
const channelService = require("../../services/channelService");
const chatService = require("../../services/chatService");
const userService = require("../../services/userService");
const messageService = require("../../services/messageService");
const handleSocketError = require("../../errors/handleSocketError");
const {logThenEmit} = require("../utils/utilsFunc");

const deleteChannel = (io, socket, connectedUsers) => {
  return async (data, callback) => {
    if (typeof callback !== "function") {
      return;
    }

    const {channelId} = data;
    const userId = socket.user.id;

    try {
      const channel = await channelService.getChannelInformation(channelId);

      if (!channel) {
        throw new AppError("Channel not found.", 404);
      }
      const chatOfChannel = await chatService.getChatOfChannel(channelId);
      if (!chatOfChannel) {
        throw new AppError("Channel's Chat not found.", 404);
      }

      const participant = chatOfChannel.participants.find(
        (part) => String(part.userId._id) === userId
      );

      if (!participant) {
        throw AppError("You are not a member of this channel", 403);
      }

      if (["Admin", "Creator"].includes(participant.role)) {
        const [deletedChannel, deletedChatOfChannel] = await Promise.all([
          channelService.deleteChannel(channelId),
          chatService.softDeleteChat(chatOfChannel._id),
        ]);

        if (deletedChannel.deleted && deletedChatOfChannel.deleted) {
          await messageService.removeChatMessages({chatId: chatOfChannel.id});
          await userService.updateMany(
            {channels: channelId},
            {$pull: {channels: channelId}}
          );
        } else {
          throw new AppError(
            "An error occurred while deleting the channel",
            500
          );
        }
      } else {
        throw new AppError(
          "You are not authorized to delete this Channel",
          401
        );
      }

      const allMembers = chatOfChannel.participants;

      logThenEmit(
        userId,
        "channel:deleted",
        {
          chatId: chatOfChannel.id,
          message: "The Channel is deleted.",
          channelId,
        },
        io.to(`channel:${channelId}`)
      );

      await Promise.all(
        allMembers.map(async (member) => {
          const userSocket = connectedUsers.get(member.userId);
          if (userSocket) {
            if (userSocket.get("channel"))
              userSocket.get("channel").leave(`channel:${channelId}`);
            if (userSocket.get("chat"))
              userSocket.get("chat").leave(`chat:${chatOfChannel.id}`);
          }
        })
      );
      callback({
        status: "ok",
        message: "Channel has been deleted",
      });
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

const removeParticipant = (io, socket, connectedUsers) => {
  return async (data, callback) => {
    if (typeof callback !== "function") {
      return;
    }

    const userId = socket.user.id;
    const {channelId} = data;
    const {subscriberId} = data;

    try {
      const channel = await channelService.getChannelInformation(channelId);

      if (!channel) {
        throw new AppError("Channel not found.", 404);
      }
      const chatOfChannel = await chatService.getChatOfChannel(channelId);
      if (!chatOfChannel) {
        throw new AppError("Channel's Chat not found.", 404);
      }

      const admin = chatOfChannel.participants.find(
        (part) => String(part.userId._id) === userId
      );

      const member = chatOfChannel.participants.find(
        (part) => String(part.userId._id) === subscriberId
      );

      if (!member) {
        throw new AppError(
          "This Member is not part of the chat participants.",
          403
        );
      }
      if (!admin || !(admin.role === "Admin" || admin.role === "Creator")) {
        throw new AppError(
          "Unauthorized Access.The user does not have the permission to add new admin.",
          403
        );
      }

      if (admin.role === "Admin" && member.role === "Creator") {
        throw new AppError(
          "Unauthorized Access.The user does not have the permission to delete the Creator.",
          401
        );
      }

      await chatService.removeParticipant(chatOfChannel.id, subscriberId);

      await userService.findByIdAndUpdate(
        subscriberId,
        {$pull: {channels: channelId}},
        {new: true}
      );

      const adminName = await userService.getUserById(
        userId,
        "screenName username"
      );

      const userSocket = connectedUsers.get(subscriberId);
      if (userSocket) {
        if (userSocket.get("channel")) {
          userSocket.get("channel").leave(`channel:${channelId}`);
          userSocket.get("channel").emit("user:removedFromChannel", {
            channelId,
            removerId: subscriberId,
            removerName: adminName.username,
          });
        }
        if (userSocket.get("chat"))
          userSocket.get("chat").leave(`chat:${chatOfChannel.id}`);
        callback({
          status: "ok",
          message: "Member has been removed",
        });
      }
    } catch (err) {
      console.log(err);
      handleSocketError(socket, err);
    }
  };
};

const addMember = (io, socket, connectedUsers) => {
  return async (data, callback) => {
    if (typeof callback !== "function") {
      return;
    }
    const userId = socket.user.id;
    const {channelId} = data;
    const {subscriberIds} = data;
    console.log("Adding member");
    try {
      if (!Array.isArray(subscriberIds)) {
        throw new AppError("subscriberIds must be an array.", 400);
      }
      const [userChannel, chatOfChannel] = await Promise.all([
        channelService.getChannelInformation(channelId),
        chatService.getChatOfChannel(channelId),
      ]);

      if (!userChannel) {
        throw new AppError(
          "Failed to retrieve channel data. Please try again later.",
          500
        );
      }
      if (!chatOfChannel) {
        throw new AppError(
          "Failed to retrieve chat data. Please try again later.",
          500
        );
      }

      const participant = chatOfChannel.participants.find(
        (p) => String(p.userId._id) === userId
      );

      if (!participant) {
        throw new AppError("You are not a member of this channel.", 400);
      }
      if (!["Admin", "Creator"].includes(participant.role)) {
        throw new AppError("You do not have the required permissions.", 403);
      }
      const admin = await userService.getUserById(userId);

      const inviterName = admin.username;
      await Promise.all(
        subscriberIds.map(async (subscriberId) => {
          const isSubscriberExists = chatOfChannel.participants.some((part) => {
            return String(part.userId._id) === subscriberId;
          });

          if (isSubscriberExists) {
            return;
          }
          const subscriberData = {
            userId: subscriberId,
            role: "Subscriber",
          };

          const updatedChat = await chatService.addParticipant(
            chatOfChannel._id,
            subscriberData
          );
          if (!updatedChat) {
            throw new AppError("Failed to update the channel's chat.", 500);
          }

          const userSocket = connectedUsers.get(subscriberId);
          if (userSocket) {
            if (userSocket.get("channel"))
              userSocket.get("channel").join(`channel:${channelId}`);
            if (userSocket.get("chat"))
              userSocket.get("chat").join(`chat:${chatOfChannel.id}`);
            userSocket.get("channel").emit("user:addedToChannel", {
              channelId,
              inviterId: userId,
              inviterName,
            });
          }
        })
      );
      callback({
        status: "ok",
        message: "Members has been added",
      });
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};

const promoteSubscriber = (io, socket, connectedUsers) => {
  return async (data, callback) => {
    if (typeof callback !== "function") {
      return;
    }
    const userId = socket.user.id;
    const {channelId} = data;
    const {subscriberId} = data;
    try {
      const [userChannel, chatOfChannel] = await Promise.all([
        channelService.getChannelInformation(channelId),
        chatService.getChatOfChannel(channelId),
      ]);

      if (!userChannel) {
        throw new AppError(
          "Failed to retrieve channel data. Please try again later.",
          500
        );
      }
      if (!chatOfChannel) {
        throw new AppError(
          "Failed to retrieve chat data. Please try again later.",
          500
        );
      }

      const participant = chatOfChannel.participants.find(
        (p) => String(p.userId._id) === userId
      );
      if (!participant) {
        throw new AppError("You are not a member of this channel.", 400);
      }
      if (!["Admin", "Creator"].includes(participant.role)) {
        throw new AppError("You do not have the required permissions.", 403);
      }

      const admin = await userService.getUserById(userId);

      const promoterName = admin.username;

      const targetSubscriber = chatOfChannel.participants.find(
        (p) => String(p.userId._id) === subscriberId
      );

      if (!targetSubscriber) {
        throw new AppError(
          "The specified user is not part of this channel.",
          404
        );
      }

      if (targetSubscriber.role === "Admin") {
        throw new AppError("The user is already an Admin.", 400);
      }
      if (targetSubscriber.role === "Creator") {
        throw new AppError("The user is already a Creator.", 400);
      }

      const updatedChat = await chatService.changeUserRole(
        chatOfChannel._id,
        subscriberId,
        "Admin"
      );

      if (!updatedChat) {
        throw new AppError("Failed to update the chat.", 500);
      }

      const userSocket = connectedUsers.get(subscriberId);
      if (userSocket) {
        if (userSocket.get("channel"))
          userSocket.get("channel").join(`channel:${channelId}`);
        if (userSocket.get("chat"))
          userSocket.get("chat").join(`chat:${chatOfChannel.id}`);
        userSocket.get("channel").emit("user:promotedToAdmin", {
          channelId,
          promotedById: userId,
          promotedBy: promoterName,
        });
      }

      callback({
        status: "ok",
        message: "Subscriber has been promoted to Admin",
      });
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};
const demoteAdmin = (io, socket, connectedUsers) => {
  return async (data, callback) => {
    if (typeof callback !== "function") {
      return;
    }
    const userId = socket.user.id;
    const {channelId} = data;
    const {subscriberId} = data;
    try {
      const [userChannel, chatOfChannel] = await Promise.all([
        channelService.getChannelInformation(channelId),
        chatService.getChatOfChannel(channelId),
      ]);

      if (!userChannel) {
        throw new AppError("Channel is not found.", 404);
      }
      if (!chatOfChannel) {
        throw new AppError(
          "Failed to retrieve chat data. Please try again later.",
          500
        );
      }

      const participant = chatOfChannel.participants.find(
        (p) => String(p.userId._id) === userId
      );
      if (!participant) {
        throw new AppError("You are not a member of this channel.", 400);
      }
      if (!["Admin", "Creator"].includes(participant.role)) {
        throw new AppError("You do not have the required permissions.", 403);
      }

      const admin = await userService.getUserById(userId);

      const demotedBy = admin.username;

      const targetSubscriber = chatOfChannel.participants.find(
        (p) => String(p.userId._id) === subscriberId
      );

      if (!targetSubscriber) {
        throw new AppError(
          "The specified user is not part of this channel.",
          404
        );
      }

      if (targetSubscriber.role === "Creator") {
        throw new AppError("Admin can not demote Creator.", 400);
      }

      if (targetSubscriber.role === "Subscriber") {
        throw new AppError("The user is already a Subscriber.", 400);
      }

      const updatedChat = await chatService.changeUserRole(
        chatOfChannel._id,
        subscriberId,
        "Subscriber"
      );

      if (!updatedChat) {
        throw new AppError("Failed to update the chat.", 500);
      }

      const userSocket = connectedUsers.get(subscriberId);
      if (userSocket) {
        if (userSocket.get("channel"))
          userSocket.get("channel").join(`channel:${channelId}`);
        if (userSocket.get("chat"))
          userSocket.get("chat").join(`chat:${chatOfChannel.id}`);
        userSocket.get("channel").emit("user:demoteOfAdmin", {
          channelId,
          demotedById: userId,
          demotedBy,
        });
      }

      callback({
        status: "ok",
        message: "Admin has been demoted to Subscriber",
      });
    } catch (err) {
      handleSocketError(socket, err);
    }
  };
};
module.exports = {
  deleteChannel,
  removeParticipant,
  addMember,
  promoteSubscriber,
  demoteAdmin,
};
