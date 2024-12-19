const catchAsync = require("../utils/catchAsync");
const AppError = require("../errors/appError");
const userService = require("../services/userService");
const groupService = require("../services/groupService");
const channelService = require("../services/channelService");
const messageService = require("../services/messageService");

const searchForUser = async (req) => {
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
  const user = await userService.searchUsers(filter, select);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

const searchForGroup = async (req) => {
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

  const group = await groupService.searchGroup(filter, select);
  if (!group) throw new AppError("Group not found", 404);
  return group;
};

const searchForChannel = async (req) => {
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

  const channel = await channelService.searchChannel(filter, select);
  if (!channel) throw new AppError("Channel not found", 404);
  return channel;
};

const searchForMessages = async (req) => {
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
    populatedOptions
  );

  const filteredDocs = docs.filter(
    (doc) =>
      doc.chatId !== null &&
      (doc.chatId?.groupId?.groupType === "Public" ||
        doc.chatId?.channelId?.privacy === false)
  );

  const result = filteredDocs.map((doc) => {
    return {
      _id: doc._id,
      chatId: doc.chatId._id,
      groupId: doc.chatId.groupId?._id,
      channelId: doc.chatId.channelId?._id,
      chatName: doc.chatId.groupId?.name || doc.chatId.channelId?.name,
      chatImage: doc.chatId.groupId?.image || doc.chatId.channelId?.imageUrl,
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
  if (type === undefined) return next(new AppError("Type is required", 400));

  let result;
  if (type === "user") {
    result = await searchForUser(req);
  } else if (type === "group") {
    result = await searchForGroup(req);
  } else if (type === "channel") {
    result = await searchForChannel(req);
  } else if (type === "message") {
    result = await searchForMessages(req);
  } else return next(new AppError("Invalid type", 400));

  return res.status(200).json({status: "success", data: {[type]: result}});
});

module.exports = {
  globalSearch,
};
