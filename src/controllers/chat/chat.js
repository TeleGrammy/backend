const chatService = require("../../services/chatService");
const catchAsync = require("../../utils/catchAsync");
const userService = require("../../services/userService");
const messageServices = require("../../services/messageService");
const AppError = require("../../errors/appError");

exports.getChat = catchAsync(async (req, res, next) => {
  const {receiver} = req.query;
  if (!receiver) {
    return res.status(400).json({error: "Receiver UUID is required."});
  }
  const recieverUser = await userService.getUserByUUID(receiver);
  if (!recieverUser) {
    return res.status(404).json({error: "Receiver not found."});
  }

  const chat = await chatService.createOneToOneChat(
    req.user.id,
    recieverUser.id
  );
  return res.status(200).json(chat);
});

exports.getChatById = catchAsync(async (req, res, next) => {
  const {id} = req.params;
  const page = parseInt(req.query.page, 10) || 1; // Default to page 1
  const limit = parseInt(req.query.limit, 10) || 30; // Default to 10 messages per page
  const skip = (page - 1) * limit;
  if (id === "undefined") {
    return next(new AppError("id must be a chat id", 400));
  }
  // Fetch the chat by ID
  const chat = await chatService.getChatById(id);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  // Check if the user is a participant in the chat
  const userExists = chat.participants.some((participant) =>
    participant.userId.equals(req.user.id)
  );

  if (!userExists) {
    return next(
      new AppError("You are not authorized to access this chat", 401)
    );
  }

  // Fetch messages related to this chat with pagination
  const messages = await messageServices.fetchChatMessages(id, skip, limit);

  // Count total messages for pagination info
  const totalMessages = await messageServices.countChatMessages(id);

  // Return chat and paginated messages
  return res.status(200).json({
    chat,
    messages: {
      totalMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      data: messages,
    },
  });
});

const handlePrivateChat = (chatObj, userId) => {
  const otherUser = chatObj.participants.find(
    (participant) => participant.userId._id.toString() !== userId
  );
  const myUser = chatObj.participants.find(
    (participant) => participant.userId._id.toString() === userId
  );
  const chat = {
    id: chatObj._id,
    name: otherUser.userId.username,
    email: otherUser.userId.email,
    photo: otherUser.userId.picture,
    status: otherUser.userId.status,
    lastSeen: otherUser.userId.lastSeen,
    joinedAt: otherUser.joinedAt,
    role: otherUser.role,
    lastMessage: chatObj.lastMessage,
    draftMessage: myUser?.draft_message,
  };

  return chat;
};

const handleGroupChat = (chatObj, userId) => {
  const myUser = chatObj.participants.find(
    (participant) => participant.userId._id.toString() === userId
  );
  const chat = {
    id: chatObj._id,
    name: chatObj.groupId.name,
    photo: chatObj.groupId.image,
    description: chatObj.groupId.description,
    lastMessage: chatObj.lastMessage,
    draftMessage: myUser?.draft_message,
    isGroup: true,
  };

  return chat;
};
exports.getAllChats = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // User ID passed as query parameter

  const page = parseInt(req.query.page, 10) || 1; // Default to page 1
  const limit = parseInt(req.query.limit, 10) || 50; // Default to 50 items per page
  const skip = (page - 1) * limit;

  let chats = await chatService.getUserChats(userId, skip, limit);

  chats = chats.map((chat) => {
    if (!chat.isGroup && !chat.isChannel) {
      return handlePrivateChat(chat, userId);
    }
    if (chat.isGroup) {
      console.log(chat.isGroup);
      return handleGroupChat(chat);
    }
    return chat;
  });
  // const chats = await userService.getUserContactsChats(userId);
  // Count total documents for pagination info
  const totalChats = await chatService.countUserChats(userId);

  return res.status(200).json({
    userId,
    totalChats,
    currentPage: page,
    totalPages: Math.ceil(totalChats / limit),
    chats,
  });
});

exports.fetchContacts = catchAsync(async (req, res, next) => {
  const {contacts} = req.body;

  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return res
      .status(400)
      .json({error: "Contacts are required as a non-empty array."});
  }

  const chats = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const contactUUID of contacts) {
    // eslint-disable-next-line no-await-in-loop
    const contactUser = await userService.getUserByUUID(contactUUID);

    if (!contactUser) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const chat = await chatService.createOneToOneChat(
      req.user.id,
      contactUser.id
    );
    chats.push(chat.id);
  }

  // Return all created chats
  return res.status(200).json({chats, chatCount: chats.length});
});
