const catchAsync = require("../../utils/catchAsync");

const Message = require("../../models/message");

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

    res.status(200).json({status: "success", data: results});
  } catch (err) {
    next(err);
  }
});

module.exports = {
  searchForMatchedContents,
};
