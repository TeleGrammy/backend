const storyController = require("../controllers/userProfile/story");
const storyService = require("../services/storyService");
const userService = require("../services/userService");
const AppError = require("../errors/appError");
const catchAsync = require("../utils/catchAsync");

jest.mock("../services/storyService");
jest.mock("../services/userService");

describe("Story Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {id: "user123"},
      body: {},
      params: {},
      file: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("inContacts", () => {
    it("should return 403 if user is not authorized", async () => {
      userService.getUserById.mockResolvedValue({
        contacts: [],
      });

      req.params.userId = "user456";

      await storyController.inContacts(req, res, next);
    });

    it("should allow access if user is in contacts", async () => {
      userService.getUserById.mockResolvedValue({
        contacts: ["user456"],
      });

      req.params.userId = "user456";

      await storyController.inContacts(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("should allow access if user is the owner of the story", async () => {
      userService.getUserById.mockResolvedValue({
        contacts: ["user456"],
      });

      req.params.userId = "user123";

      await storyController.inContacts(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe("createStory", () => {
    it("should create a story with valid content and media", async () => {
      req.body = {content: "Test story", mediaType: "image"};
      req.file = {key: "media123"};

      const createdStory = {
        id: "story123",
        userId: "user123",
        content: "Test story",
      };
      userService.getUserById.mockResolvedValue({_id: "user123"});
      storyService.create.mockResolvedValue(createdStory);

      await storyController.createStory(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith("user123");
      expect(storyService.create).toHaveBeenCalledWith({
        userId: "user123",
        content: "Test story",
        mediaKey: "media123",
        mediaType: "image",
      });
    });

    it("should return an error if neither content nor media is provided", async () => {
      req.body = {};
      req.file = null;

      await storyController.createStory(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should return an error if media type is not provided", async () => {
      req.body = {content: "Test story"};
      req.file = {key: "media123"};

      await storyController.createStory(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
