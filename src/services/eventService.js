const Event = require("../models/event");
const getNextId = require("../utils/snowFlakeID");

module.exports.create = async (eventData) => {
  eventData.index = getNextId();
  const event = await Event.create(eventData);
  return event;
};

module.exports.getEvents = async (chatId, offset) => {
  const events = await Event.find({
    chatId,
    index: {$gt: offset},
  }).sort({index: 1});

  return events;
};
