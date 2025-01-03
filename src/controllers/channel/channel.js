const {validationResult} = require("express-validator");
const crypto = require("crypto");

const catchAsync = require("../../utils/catchAsync");

const AppError = require("../../errors/appError");

const channelService = require("../../services/channelService");
const chatService = require("../../services/chatService");
const messageService = require("../../services/messageService");

const updateChannelHelper = async (
  req,
  res,
  next,
  userChannel,
  chatOfChannel
) => {
  try {
    const {name, image, description} = req.body;

    userChannel.name = chatOfChannel.name = name;
    userChannel.description = chatOfChannel.description = description;
    userChannel.image = image;
    await Promise.all([userChannel.save(), chatOfChannel.save()]);

    return res.status(200).json({
      status: "success",
      channelName: userChannel.name,
      channelDescription: userChannel.description,
    });
  } catch (error) {
    return next(
      new AppError("An error occurred while updating the channel data", 500)
    );
  }
};

const createChannel = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const transformedErrors = errors.array().map((error) => ({
      errorType: error.type,
      message: error.msg,
    }));
    return res.status(400).json(transformedErrors);
  }

  const userId = req.user.id;
  const {name, image, description} = req.body;

  try {
    const createdChannel = await channelService.createChannel({
      name,
      description,
      image,
      ownerId: userId,
      membersCount: 0,
    });
    if (!createdChannel) {
      next(new AppError("Error creating the channel", 500));
    }

    const createdChat = await chatService.createChat({
      name,
      isChannel: true,
      channelId: createdChannel._id,
    });
    if (!createdChat) {
      next(new AppError("Error creating the channel's chat", 500));
    }

    const currentUserData = {userId, role: "Creator"};
    const updatedChat = await chatService.addParticipant(
      createdChat._id,
      currentUserData
    );
    if (!updatedChat) {
      next(
        new AppError("Error adding user as creator in the channel chat", 500)
      );
    }

    const creationMessage = {
      senderId: userId,
      chatId: createdChat._id,
      messageType: "text",
      content: "Channel created",
      isPost: true,
    };
    const createdMessage = await messageService.createMessage(creationMessage);
    if (!createdMessage) {
      next(new AppError("Error creating the channel's creation message", 500));
    }

    return res.status(200).json({
      channelId: createdChannel._id,
      channelName: createdChannel.name,
      channelDescription: createdChannel.description,
      chatId: updatedChat._id,
    });
  } catch (error) {
    return next(error);
  }
});

const updateChannel = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const transformedErrors = errors.array().map((error) => ({
      errorType: error.type,
      message: error.msg,
    }));
    return res.status(400).json({status: "fail", errors: transformedErrors});
  }

  const {channelId} = req.params;
  const userId = req.user.id;

  const [userChannel, chatOfChannel] = await Promise.all([
    channelService.getChannelInformation(channelId),
    chatService.getChatOfChannel(channelId),
  ]);

  if (!userChannel || !chatOfChannel) {
    const errorMessage = userChannel
      ? "Channel's chat not found. Please try again later"
      : "Channel not found. Please check its ID";
    return next(new AppError(errorMessage, userChannel ? 500 : 404));
  }

  const {metaDataPolicy} = userChannel;

  if (metaDataPolicy === "Admins") {
    const isAdmin =
      chatOfChannel.participants &&
      chatOfChannel.participants.some(
        (participant) =>
          (participant.role === "Admin" || participant.role === "Creator") &&
          String(participant.userId._id) === userId
      );

    if (!isAdmin) {
      return next(new AppError("You are not an admin for this channel", 403));
    }
  } else if (metaDataPolicy !== "EveryOne") {
    return next(new AppError("Invalid channel metadata policy", 400));
  }

  return updateChannelHelper(req, res, next, userChannel, chatOfChannel);
});

const deleteChannel = catchAsync(async (req, res, next) => {
  const {channelId} = req.params;
  const userId = req.user.id;

  const channel = await channelService.getChannelInformation(channelId);
  if (!channel) {
    return next(new AppError("Channel not found", 404));
  }
  const chatOfChannel = await chatService.getChatOfChannel(channelId);

  const participant = chatOfChannel.participants.find(
    (part) => String(part.userId._id) === userId
  );

  if (!participant) {
    return next(new AppError("You are not a member of this channel", 403));
  }

  if (participant.role === "Creator") {
    const [deletedChannel, deletedChatOfChannel] = await Promise.all([
      channelService.deleteChannel(channelId),
      chatService.softDeleteChat(chatOfChannel._id),
    ]);

    if (deletedChannel.deleted && deletedChatOfChannel.deleted) {
      return res.status(204).json({
        status: "success",
        message: "Channel deleted successfully",
      });
    }
    return next(
      new AppError("An error occurred while deleting the channel", 500)
    );
  }
  if (participant.role === "Subscriber" || participant.role === "Admin") {
    const updatedChat = await chatService.removeParticipant(
      chatOfChannel._id,
      userId
    );
    if (!updatedChat) {
      return next(
        new AppError("An error occurred while leaving the channel", 500)
      );
    }

    return res.status(200).json({
      status: "success",
      message: "You have successfully left the channel",
    });
  }

  return next(new AppError("Invalid role. Operation not allowed", 403));
});

const getChannel = catchAsync(async (req, res, next) => {
  const {channelId} = req.params;

  const channelData = await channelService.getChannelInformation(channelId);

  if (!channelData) {
    return next(new AppError("Channel not found. Please check its ID.", 404));
  }
  return res.status(200).json({
    channelId,
    channelName: channelData.name,
    channelDescription: channelData.description,
    subscribersCount: channelData.membersCount,
    channelPrivacy: channelData.privacy ? "Public" : "Private",
    metaDataPolicy: channelData.metaDataPolicy,
    commentEnable: channelData.comments,
    channelOwner: {
      id: channelData.ownerId._id,
      name: channelData.ownerId.screenName || channelData.ownerId.username,
      phone: channelData.ownerId.phone,
      profilePicture: channelData.ownerId.picture,
    },
    channelCreationDate: channelData.createdAt,
  });
});

const promoteSubscriber = catchAsync(async (req, res, next) => {
  const {channelId, subscriberId} = req.params;
  const userId = req.user.id;

  const [userChannel, chatOfChannel] = await Promise.all([
    channelService.getChannelInformation(channelId),
    chatService.getChatOfChannel(channelId),
  ]);

  if (!userChannel) {
    return next(
      new AppError(
        "Failed to retrieve channel data. Please try again later.",
        500
      )
    );
  }
  if (!chatOfChannel) {
    return next(
      new AppError("Failed to retrieve chat data. Please try again later.", 500)
    );
  }

  const participant = chatOfChannel.participants.find(
    (p) => String(p.userId._id) === userId
  );

  if (!participant) {
    return next(new AppError("You are not a member of this channel.", 400));
  }
  if (!["Admin", "Creator"].includes(participant.role)) {
    return next(new AppError("You do not have the required permissions.", 403));
  }

  const targetSubscriber = chatOfChannel.participants.find(
    (p) => String(p.userId._id) === subscriberId
  );

  if (!targetSubscriber) {
    return next(
      new AppError("The specified user is not part of this channel.", 404)
    );
  }
  if (["Admin", "Creator"].includes(targetSubscriber.role)) {
    return next(new AppError("The user is already an admin or creator.", 400));
  }

  const updatedChat = await chatService.changeUserRole(
    chatOfChannel._id,
    subscriberId,
    "Admin"
  );

  if (!updatedChat) {
    return next(new AppError("Failed to update the chat.", 500));
  }

  const transformedParticipants = updatedChat.participants.map(
    ({userId, role}) => ({
      userData: {
        id: userId._id,
        name: userId.screenName,
        profilePicture: userId.profilePicture,
        phone: userId.phone,
      },
      role,
    })
  );

  return res.status(200).json({
    status: "success",
    data: {
      participants: transformedParticipants,
    },
  });
});

const demoteAdmin = catchAsync(async (req, res, next) => {
  const {channelId, subscriberId} = req.params;
  const userId = req.user.id;

  const [userChannel, chatOfChannel] = await Promise.all([
    channelService.getChannelInformation(channelId),
    chatService.getChatOfChannel(channelId),
  ]);

  if (!userChannel) {
    return next(
      new AppError(
        "Failed to retrieve channel data. Please try again later.",
        500
      )
    );
  }
  if (!chatOfChannel) {
    return next(
      new AppError("Failed to retrieve chat data. Please try again later.", 500)
    );
  }

  const participant = chatOfChannel.participants.find(
    (p) => String(p.userId._id) === userId
  );

  if (!participant) {
    return next(new AppError("You are not a member of this channel.", 400));
  }
  if (!["Admin", "Creator"].includes(participant.role)) {
    return next(new AppError("You do not have the required permissions.", 403));
  }

  const targetSubscriber = chatOfChannel.participants.find(
    (p) => String(p.userId._id) === subscriberId
  );

  if (!targetSubscriber) {
    return next(
      new AppError("The specified user is not part of this channel.", 404)
    );
  }
  if (targetSubscriber.role !== "Admin") {
    return next(
      new AppError("The user is already a subscriber or creator", 400)
    );
  }

  const updatedChat = await chatService.changeUserRole(
    chatOfChannel._id,
    subscriberId,
    "Subscriber"
  );

  if (!updatedChat) {
    return next(new AppError("Failed to update the chat.", 500));
  }

  const transformedParticipants = updatedChat.participants.map(
    ({userId, role}) => ({
      userData: {
        id: userId._id,
        name: userId.screenName,
        profilePicture: userId.profilePicture,
        phone: userId.phone,
      },
      role,
    })
  );

  return res.status(204).json({
    status: "success",
    data: {
      participants: transformedParticipants,
    },
  });
});

const joinChannel = catchAsync(async (req, res, next) => {
  const {channelId} = req.params;
  const userId = req.user.id;

  const [channel, chatOfChannel] = await Promise.all([
    channelService.getChannelInformation(channelId),
    chatService.getChatOfChannel(channelId),
  ]);

  if (!channel) {
    return next(new AppError("Channel not found.", 500));
  }
  if (!chatOfChannel) {
    return next(
      new AppError("Failed to retrieve chat data. Please try again later.", 500)
    );
  }

  const isSubscriberExists = chatOfChannel.participants.some((participant) => {
    return String(participant.userId._id) === userId;
  });

  if (isSubscriberExists) {
    return next(new AppError("User already exists in Channel", 400));
  }

  if (!channel.privacy) {
    return next(new AppError("You can't join Private Channel", 401));
  }
  const subscriberData = {
    userId,
    role: "Subscriber",
  };

  const updatedChat = await chatService.addParticipant(
    chatOfChannel._id,
    subscriberData
  );

  if (!updatedChat) {
    return next(new AppError("Failed to update the channel's chat.", 500));
  }

  const chat = {
    ...updatedChat.toObject(), // Convert Mongoose document to plain object
  };
  delete chat.participants; // Remove the `participants` property

  return res.status(200).json({
    status: "success",
    data: {
      channel,
      chat,
    },
  });
});
const addSubscriber = catchAsync(async (req, res, next) => {
  const {channelId, subscriberId} = req.params;
  const userId = req.user.id;

  const [userChannel, chatOfChannel] = await Promise.all([
    channelService.getChannelInformation(channelId),
    chatService.getChatOfChannel(channelId),
  ]);

  if (!userChannel) {
    return next(
      new AppError(
        "Failed to retrieve channel data. Please try again later.",
        500
      )
    );
  }
  if (!chatOfChannel) {
    return next(
      new AppError("Failed to retrieve chat data. Please try again later.", 500)
    );
  }

  const participant = chatOfChannel.participants.find(
    (p) => String(p.userId._id) === userId
  );

  if (!participant) {
    return next(new AppError("You are not a member of this channel.", 400));
  }
  if (!["Admin", "Creator"].includes(participant.role)) {
    return next(new AppError("You do not have the required permissions.", 403));
  }

  const isSubscriberExists = chatOfChannel.participants.some((part) => {
    return String(part.userId._id) === subscriberId;
  });

  if (isSubscriberExists) {
    return next(new AppError("Target subscriber already exists", 400));
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
    return next(new AppError("Failed to update the channel's chat.", 500));
  }

  const updatedChatOfChannel = await chatService.getChatOfChannel(channelId);

  if (!updatedChatOfChannel) {
    return next(
      new AppError(
        "Failed to retrieve updated chat data. Please try again later.",
        500
      )
    );
  }

  const transformedParticipants = updatedChatOfChannel.participants
    .map(({userId, role}) => {
      // Check if userId is properly populated
      if (!userId || !userId._id) {
        // Log the problematic participant for debugging
        console.log("Skipping participant with invalid userId:", {
          userId,
          role,
        });
        return null; // Return null for invalid participants
      }

      return {
        userData: {
          id: userId._id, // Safe to access since we've checked for existence
          name: userId.username || "No name", // Default if missing
          profilePicture: userId.profilePicture || "", // Default empty string if missing
          phone: userId.phone || "N/A", // Default to N/A if missing
        },
        role,
      };
    })
    .filter((part) => part !== null); // Filter out any null entries

  return res.status(200).json({
    status: "success",
    data: {
      participants: transformedParticipants,
    },
  });
});
const fetchChannelParticipants = catchAsync(async (req, res, next) => {
  const {channelId} = req.params;

  const chat = await chatService.getChatOfChannel(channelId);
  if (!chat) {
    throw new AppError("Channel Chat not found, Try again later", 500);
  }
  await chatService.checkUserAdmin(chat.id, req.user.id);

  const transformedParticipants = chat.participants
    .map(({userId, role, canDownload}) => {
      // Check if userId is properly populated
      if (!userId || !userId._id) {
        // Log the problematic participant for debugging
        console.log("Skipping participant with invalid userId:", {
          userId,
          role,
        });
        return null; // Return null for invalid participants
      }

      return {
        userData: {
          id: userId._id, // Safe to access since we've checked for existence
          name: userId.username || "No name", // Default if missing
          profilePicture: userId.picture || "", // Default empty string if missing
          phone: userId.phone || "N/A", // Default to N/A if missing
          canDownload,
        },
        role,
      };
    })
    .filter((part) => part !== null); // Filter out any null entries

  return res.status(200).json({
    participants: transformedParticipants,
  });
});

const fetchChannelChat = catchAsync(async (req, res, next) => {
  const {channelId} = req.params;
  const {page = 1, limit = 20} = req.query;
  await channelService.checkUserParticipant(channelId, req.user.id);

  const result = await channelService.getChannelChatWithThreads(
    channelId,
    Number(page),
    Number(limit)
  );
  res.status(200).json(result);
});

const fetchThreadsMesssage = catchAsync(async (req, res) => {
  const {postId} = req.params;
  const {page = 1, limit = 20} = req.query; // Pagination params from query string
  const result = await channelService.getThreadMessages(
    postId,
    req.user.id,
    Number(page),
    Number(limit)
  );
  res.status(200).json(result);
});

const updatePrivacy = catchAsync(async (req, res) => {
  const {channelId} = req.params;
  const {privacy, comments, download} = req.body;

  // Validate input if needed
  const updateData = {};
  if (typeof privacy !== "undefined") updateData.privacy = privacy;
  if (typeof comments !== "undefined") updateData.comments = comments;
  if (typeof download !== "undefined") updateData.download = download;
  // Update the channel document
  const updatedChannel = await channelService.updateChannelPrivacy(
    channelId,
    req.user.id,
    updateData
  );

  if (!updatedChannel) {
    return res.status(404).json({message: "Channel not found"});
  }
  return res
    .status(200)
    .json({message: "Channel updated successfully", data: updatedChannel});
});

const updateSubscriberSettings = catchAsync(async (req, res, next) => {
  const {channelId} = req.params;
  const {subscriberId, download} = req.body;

  const userId = req.user.id;
  const chatOfChannel = await chatService.getChatOfChannel(channelId);
  if (!chatOfChannel) {
    throw new AppError("Chat of Channel is not found");
  }

  await chatService.checkUserAdmin(chatOfChannel._id, userId);

  const subscriberUser = await chatService.checkUserParticipant(
    chatOfChannel._id,
    subscriberId
  );

  if (subscriberUser.role === "Admin" || subscriberUser.role === "Creator") {
    throw new AppError("Operation is not allowed for Admin or Creator");
  }

  const updatedChat = await chatService.changeParticipantPermission(
    chatOfChannel._id,
    subscriberId,
    download
  );

  if (!updatedChat) {
    return res.status(404).json({message: "Channel not found"});
  }
  return res.status(200).json({
    message: "Subscriber permission updated successfully",
    data: updatedChat,
  });
});

const getInviteLink = catchAsync(async (req, res, next) => {
  const {channelId} = req.params;

  const channel = await channelService.getChannelInformation(channelId);

  if (!channel) {
    next(new AppError("Channel not found", 404));
  }
  const userId = req.user.id;
  const chatOfChannel = await chatService.getChatOfChannel(channelId);
  if (!chatOfChannel) {
    next(new AppError("Chat of Channel is not found", 500));
  }

  await chatService.checkUserAdmin(chatOfChannel._id, userId);

  if (!channel.inviteToken) {
    const inviteToken = crypto.randomBytes(16).toString("hex");
    channel.inviteToken = inviteToken;
    await channel.save();
  }
  const inviteLink = `${req.protocol}://${req.get("host")}/api/v1/channels/${channelId}/invite/${channel.inviteToken}`;

  return res.status(200).json({
    message: "Channel Links generated successfully",
    data: inviteLink,
  });
});

const getChannelByInvite = catchAsync(async (req, res, next) => {
  const {channelId, inviteToken} = req.params;

  const channel = await channelService.getChannelInformation(channelId);

  if (!channel) {
    next(new AppError("Channel not found", 404));
  }

  if (!channel.inviteToken || channel.inviteToken !== inviteToken) {
    return res.status(401).json({message: "This Channel Links is not valid"});
  }

  return res
    .status(300)
    .redirect(
      `${process.env.FRONTEND_LOGIN_CALLBACK}?channelId=${channelId}&inviteToken=${inviteToken}`
    );
});

const showChannelByInvite = catchAsync(async (req, res, next) => {
  const {channelId, inviteToken} = req.params;

  const channel = await channelService.getChannelInformation(channelId);

  if (!channel) {
    next(new AppError("Channel not found", 404));
  }

  if (!channel.inviteToken || channel.inviteToken !== inviteToken) {
    return res.status(401).json({message: "This Channel Links is not valid"});
  }

  return res.status(200).json(channel);
});

const joinChannelByInvite = catchAsync(async (req, res, next) => {
  const {channelId, inviteToken} = req.params;

  const channel = await channelService.getChannelInformation(channelId);

  if (!channel) {
    next(new AppError("Channel not found", 404));
  }

  if (!channel.inviteToken || channel.inviteToken !== inviteToken) {
    return res.status(401).json({message: "This Channel Links is not valid"});
  }
  const userId = req.user.id;

  const chatOfChannel = await chatService.getChatOfChannel(channelId);

  if (!channel) {
    return next(new AppError("Channel not found.", 500));
  }
  if (!chatOfChannel) {
    return next(
      new AppError("Failed to retrieve chat data. Please try again later.", 500)
    );
  }

  const isSubscriberExists = chatOfChannel.participants.some((participant) => {
    return String(participant.userId._id) === userId;
  });

  if (isSubscriberExists) {
    return next(new AppError("User already exists in Channel", 400));
  }

  const subscriberData = {
    userId,
    role: "Subscriber",
  };

  const updatedChat = await chatService.addParticipant(
    chatOfChannel._id,
    subscriberData
  );

  if (!updatedChat) {
    return next(new AppError("Failed to update the channel's chat.", 500));
  }

  const chat = {
    ...updatedChat.toObject(), // Convert Mongoose document to plain object
  };
  delete chat.participants; // Remove the `participants` property

  return res.status(200).json({
    status: "success",
    data: {
      channel,
      chat,
    },
  });
});

module.exports = {
  createChannel,
  updateChannel,
  deleteChannel,
  getChannel,
  promoteSubscriber,
  demoteAdmin,
  addSubscriber,
  joinChannel,
  fetchChannelChat,
  fetchThreadsMesssage,
  updatePrivacy,
  fetchChannelParticipants,
  updateSubscriberSettings,
  getInviteLink,
  getChannelByInvite,
  showChannelByInvite,
  joinChannelByInvite,
};
