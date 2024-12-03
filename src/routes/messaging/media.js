const express = require("express");

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
router.post("/audio", uploadAudio, uploadAudioHandler);
router.post("/media", uploadMedia, uploadMediaHandler);
router.post("/document", uploadDocument, uploadDocumentHandler);
router.post("/sticker", uploadSticker, uploadStickerHandler);

module.exports = router;
