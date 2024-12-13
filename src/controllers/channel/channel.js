const {validationResult} = require("express-validator");

const catchAsync = require("../../utils/catchAsync");

const AppError = require("../../errors/appError");

const channelService = require("../../services/channelService");
const chatService = require("../../services/chatService");
const messageService = require("../../services/messageService");
const userService = require("../../services/userService");

const updateChannelHelper = async (
  req,
  res,
  next,
  userChannel,
  chatOfChannel
) => {
  try {
    const {name, description} = req.body;

    userChannel.name = chatOfChannel.name = name;
    userChannel.description = chatOfChannel.description = description;

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
    });
    if (!createdChannel) {
      throw new AppError("Error creating the channel", 500);
    }

    const createdChat = await chatService.createChat({
      name,
      isChannel: true,
      channelId: createdChannel._id,
    });
    if (!createdChat) {
      throw new AppError("Error creating the channel's chat", 500);
    }

    const currentUserData = {userId, role: "Creator"};
    const updatedChat = await chatService.addParticipant(
      createdChat._id,
      currentUserData
    );
    if (!updatedChat) {
      throw new AppError("Error adding user as admin in the channel chat", 500);
    }
    const ownerData = await userService.getUserByID(userId);
    ownerData.channels.push(createdChannel.id);
    await ownerData.save();

    const creationMessage = {
      senderId: userId,
      chatId: createdChat._id,
      messageType: "text",
      content: "Channel created",
    };
    const createdMessage = await messageService.createMessage(creationMessage);
    if (!createdMessage) {
      throw new AppError("Error creating the channel's creation message", 500);
    }

    return res.status(200).json({
      status: "success",
      data: {
        channelId: createdChannel._id,
        channelName: createdChannel.name,
        channelDescription: createdChannel.description,
      },
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

  const chatOfChannel = await chatService.getChatOfChannel(channelId);
  if (!chatOfChannel) {
    return next(new AppError("Channel not found", 404));
  }

  const participant = chatOfChannel.participants.find(
    (part) => String(part.userId) === userId
  );

  if (!participant) {
    return next(new AppError("You are not a member of this channel", 403));
  }

  if (["Admin", "Creator"].includes(participant.role)) {
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
  if (participant.role === "Subscriber") {
    const updatedChat = await chatService.removeParticipant(
      chatOfChannel._id,
      userId
    );
    if (!updatedChat) {
      return next(
        new AppError("An error occurred while leaving the channel", 500)
      );
    }

    return res.status(204).json({
      status: "success",
      message: "You have successfully left the channel",
    });
  }

  return next(new AppError("Invalid role. Operation not allowed", 403));
});

const getChannel = catchAsync(async (req, res, next) => {
  const {channelId} = req.params;

  const [channelData, chatData] = await Promise.all([
    channelService.getChannelInformation(channelId),
    chatService.getChatOfChannel(channelId),
  ]);

  if (!channelData) {
    return next(new AppError("Channel not found. Please check its ID.", 404));
  }

  if (!chatData) {
    return next(
      new AppError("Channel's chat not found. Please try again later.", 500)
    );
  }

  const ownerId = chatData.participants.find(
    (participant) => participant.role === "Creator"
  );
  if (!ownerId) {
    return next(
      new AppError(
        "Channel owner's data is missing. Please try again later.",
        500
      )
    );
  }
  const ownerData = userService.getUserByID(ownerId.userId);

  return res.status(200).json({
    channelId,
    channelName: channelData.name,
    channelDescription: channelData.description,
    subscribersCount: channelData.membersCount,
    channelOwner: {
      id: ownerData.id,
      name: ownerData.screenName,
      phone: ownerData.phone,
      profilePicture: ownerData.profilePicture,
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

  const isSubscriberExists = chatOfChannel.participants.some((participant) => {
    return String(participant.userId._id) === subscriberId;
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
  console.log(req.user.id);
  await channelService.checkUserParticipant(channelId, req.user.id);

  const channel = await chatService.getChatOfChannel(channelId);
  const transformedParticipants = channel.participants
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

module.exports = {
  createChannel,
  updateChannel,
  deleteChannel,
  getChannel,
  promoteSubscriber,
  demoteAdmin,
  addSubscriber,
  fetchChannelChat,
  fetchThreadsMesssage,
  updatePrivacy,
  fetchChannelParticipants,
};
