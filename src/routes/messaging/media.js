const express = require("express");

const isAuth = require("../../middlewares/isAuthenticated");

const {
  uploadDocument,
  uploadAudio,
  uploadMedia,
  uploadSticker,
} = require("../../middlewares/AWS");

const {
  uploadDocumentHandler,
  uploadAudioHandler,
  uploadMediaHandler,
  uploadStickerHandler,
} = require("../../controllers/messaging/media");

const router = express.Router();
router.post("/audio", isAuth, uploadAudio, uploadAudioHandler);
router.post("/media", uploadMedia, uploadMediaHandler);
router.post("/document", isAuth, uploadDocument, uploadDocumentHandler);
router.post("/sticker", isAuth, uploadSticker, uploadStickerHandler);

module.exports = router;

