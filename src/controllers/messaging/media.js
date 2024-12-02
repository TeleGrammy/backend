const AppError = require("../../errors/appError");
const catchAsync = require("../../utils/catchAsync");
const {generateSignedUrl} = require("../../middlewares/AWS");

exports.uploadAudioHandler = catchAsync(async (req, res, next) => {
  const {content} = req.body;
  const mediaKey = req.file ? req.file.key : null;
  if (!content && !mediaKey) {
    next(new AppError("No content or audio provided.", 400));
    return;
  }

  const signedUrl = await generateSignedUrl(mediaKey);

  res.send({
    message: "Audio uploaded successfully",
    signedUrl,
    mediaKey,
  });
});

exports.uploadMediaHandler = catchAsync(async (req, res, next) => {
  const {content} = req.body;
  const mediaKey = req.file ? req.file.key : null;
  if (!content && !mediaKey) {
    next(new AppError("No content or media provided.", 400));
    return;
  }

  const signedUrl = await generateSignedUrl(mediaKey);

  res.send({
    message: "Media uploaded successfully",
    signedUrl,
    mediaKey,
  });
});

exports.uploadDocumentHandler = catchAsync(async (req, res, next) => {
  const {content} = req.body;
  const mediaKey = req.file ? req.file.key : null;
  if (!content && !mediaKey) {
    next(new AppError("No content or document provided.", 400));
    return;
  }

  const signedUrl = await generateSignedUrl(mediaKey);

  res.send({
    message: "Document uploaded successfully",
    signedUrl,
    mediaKey,
  });
});

exports.uploadStickerHandler = catchAsync(async (req, res, next) => {
  const {content} = req.body;
  const mediaKey = req.file ? req.file.key : null;
  if (!content && !mediaKey) {
    next(new AppError("No content or sticker provided.", 400));
    return;
  }

  const signedUrl = await generateSignedUrl(mediaKey);

  res.send({
    message: "Sticker uploaded successfully",
    signedUrl,
    mediaKey,
  });
});
