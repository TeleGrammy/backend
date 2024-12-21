/* eslint-disable no-undef */

const {
  uploadAudioHandler,
  uploadMediaHandler,
  uploadDocumentHandler,
  uploadStickerHandler,
} = require("../controllers/messaging/media");
const {generateSignedUrl} = require("../middlewares/AWS");
const AppError = require("../errors/appError");

jest.mock("../middlewares/AWS");

const mockNext = jest.fn();

describe("Upload Handlers", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      file: null,
    };
    res = {
      send: jest.fn(),
    };
    mockNext.mockClear();
    generateSignedUrl.mockClear();
  });

  describe("uploadAudioHandler", () => {
    it("should upload audio and return signed URL", async () => {
      req.body.content = "Audio content";
      req.file = {key: "audio-file-key"};
      generateSignedUrl.mockResolvedValue("https://signed-url.com/audio");

      await uploadAudioHandler(req, res, mockNext);

      expect(generateSignedUrl).toHaveBeenCalledWith("audio-file-key");
      expect(res.send).toHaveBeenCalledWith({
        message: "Audio uploaded successfully",
        signedUrl: "https://signed-url.com/audio",
        mediaKey: "audio-file-key",
      });
    });

    it("should call next with error if no content or media key is provided", async () => {
      await uploadAudioHandler(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError("No content or audio provided.", 400)
      );
    });
  });

  describe("uploadMediaHandler", () => {
    it("should upload media and return signed URL", async () => {
      req.body.content = "Media content";
      req.file = {key: "media-file-key"};
      generateSignedUrl.mockResolvedValue("https://signed-url.com/media");

      await uploadMediaHandler(req, res, mockNext);

      expect(generateSignedUrl).toHaveBeenCalledWith("media-file-key");
      expect(res.send).toHaveBeenCalledWith({
        message: "Media uploaded successfully",
        signedUrl: "https://signed-url.com/media",
        mediaKey: "media-file-key",
      });
    });

    it("should call next with error if no content or media key is provided", async () => {
      await uploadMediaHandler(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError("No content or media provided.", 400)
      );
    });
  });

  describe("uploadDocumentHandler", () => {
    it("should upload document and return signed URL", async () => {
      req.body.content = "Document content";
      req.file = {key: "document-file-key"};
      generateSignedUrl.mockResolvedValue("https://signed-url.com/document");

      await uploadDocumentHandler(req, res, mockNext);

      expect(generateSignedUrl).toHaveBeenCalledWith("document-file-key");
      expect(res.send).toHaveBeenCalledWith({
        message: "Document uploaded successfully",
        signedUrl: "https://signed-url.com/document",
        mediaKey: "document-file-key",
      });
    });

    it("should call next with error if no content or media key is provided", async () => {
      await uploadDocumentHandler(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError("No content or document provided.", 400)
      );
    });
  });

  describe("uploadStickerHandler", () => {
    it("should upload sticker and return signed URL", async () => {
      req.body.content = "Sticker content";
      req.file = {key: "sticker-file-key"};
      generateSignedUrl.mockResolvedValue("https://signed-url.com/sticker");

      await uploadStickerHandler(req, res, mockNext);

      expect(generateSignedUrl).toHaveBeenCalledWith("sticker-file-key");
      expect(res.send).toHaveBeenCalledWith({
        message: "Sticker uploaded successfully",
        signedUrl: "https://signed-url.com/sticker",
        mediaKey: "sticker-file-key",
      });
    });

    it("should call next with error if no content or media key is provided", async () => {
      await uploadStickerHandler(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError("No content or sticker provided.", 400)
      );
    });
  });
});
