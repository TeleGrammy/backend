const catchAsync = require("../utils/catchAsync");
const AppError = require("../errors/appError");
const userService = require("../services/userService");
const groupService = require("../services/groupService");
const channelService = require("../services/channelService");
const messageService = require("../services/messageService");
const Message = require("../models/message");

const searchForUser = async (req, skip, limit) => {
  const {uuid} = req.query;
  if (uuid === undefined || uuid === "")
    throw new AppError("UUID is required", 400);

  const regexUUID = {$regex: uuid, $options: "i"};
  const filter = {
    $or: [
      {username: regexUUID},
      {screenName: regexUUID},
      {email: regexUUID},
      {phone: regexUUID},
    ],
  };

  const select = "_id username screenName email phone picture lastSeen";
  const user = await userService.searchUsers(filter, select, skip, limit);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

const searchForGroup = async (req, skip, limit) => {
  const {name} = req.query;
  if (name === undefined || name === "")
    throw new AppError("UUID is required", 400);

  const filter = {
    $or: [{name: {$regex: name, $options: "i"}}],
  };

  const select = {
    _id: 1,
    name: 1,
    image: 1,
    description: 1,
    chatId: 1,
    totalMembers: {$add: [{$size: "$members"}, {$size: "$admins"}]},
  };

  const group = await groupService.searchGroup(filter, select, skip, limit);
  if (!group) throw new AppError("Group not found", 404);
  return group;
};

const searchForChannel = async (req, skip, limit) => {
  const {name} = req.query;
  if (name === undefined || name === "")
    throw new AppError("UUID is required", 400);

  const filter = {
    $or: [{name: {$regex: name, $options: "i"}}],
  };

  const select = {
    _id: 1,
    name: 1,
    imageUrl: 1,
    description: 1,
    chatId: 1,
    membersCount: 1,
  };

  const channel = await channelService.searchChannel(
    filter,
    select,
    skip,
    limit
  );
  if (!channel) throw new AppError("Channel not found", 404);
  return channel;
};

const searchForMessages = async (req, skip, limit) => {
  const {message} = req.query;
  if (message === undefined || message === "")
    throw new AppError("Message is required", 400);

  const filter = {
    $or: [{content: {$regex: message, $options: "i"}}],
  };

  const select = {
    _id: 1,
    chatId: 1,
    messageType: 1,
    content: 1,
    mediaUrl: 1,
    timestamp: 1,
  };

  const populatedOptions = [
    {
      path: "chatId",
      select: "_id groupId channelId",
      populate: [
        {
          path: "groupId",
          select: "name image _id groupType",
        },
        {
          path: "channelId",
          select: "name imageUrl _id privacy",
        },
      ],
    },
  ];
  const docs = await messageService.searchMessages(
    filter,
    select,
    skip,
    limit,
    populatedOptions
  );

  const filteredDocs = docs.filter(
    (doc) =>
      doc.chatId !== null &&
      (doc.chatId?.groupId?.groupType === "Public" ||
        doc.chatId?.channelId?.privacy === true)
  );

  const result = filteredDocs.map((doc) => {
    return {
      _id: doc._id,
      chatId: doc.chatId._id,
      groupId: doc.chatId.groupId?._id,
      channelId: doc.chatId.channelId?._id,
      groupName: doc.chatId.groupId?.name,
      channelName: doc.chatId.channelId?.name,
      groupImage: doc.chatId.groupId?.image,
      channelImage: doc.chatId.channelId?.imageUrl,
      messageType: doc.messageType,
      content: doc.content,
      mediaUrl: doc.mediaUrl,
      timestamp: doc.timestamp,
    };
  });

  return result;
};

const globalSearch = catchAsync(async (req, res, next) => {
  const {type} = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  if (type === undefined) return next(new AppError("Type is required", 400));

  let result;
  if (type === "user") {
    result = await searchForUser(req, skip, limit);
  } else if (type === "group") {
    result = await searchForGroup(req, skip, limit);
  } else if (type === "channel") {
    result = await searchForChannel(req, skip, limit);
  } else if (type === "message") {
    result = await searchForMessages(req, skip, limit);
  } else return next(new AppError("Invalid type", 400));

  return res.status(200).json({
    status: "success",
    page,
    limit,
    totalDocs: result.length,
    data: {[type]: result},
  });
});

const searchForMatchedContents = catchAsync(async (req, res, next) => {
  const {searchText, mediaType, limit, skip} = req.body;
  const {chatId} = req.params;

  try {
    const results = await Message.searchMessages({
      messageType: mediaType,
      chatId,
      searchText,
      limit,
      skip,
    });

    res.status(200).json({status: "success", data: {message: results}});
  } catch (err) {
    next(err);
  }
});

module.exports = {
  globalSearch,
  searchForMatchedContents,
};
