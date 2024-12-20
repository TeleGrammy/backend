/* eslint-disable no-undef */

const {validationResult} = require("express-validator");
const channelService = require("../services/channelService");
const chatService = require("../services/chatService");
const Chat = require("../models/chat");
const messageService = require("../services/messageService");
const AppError = require("../errors/appError");
const {
  createChannel,
  updateChannel,
  deleteChannel,
  getChannel,
  promoteSubscriber,
  demoteAdmin,
  joinChannel,
  addSubscriber,
  fetchChannelParticipants,
  fetchChannelChat,
  fetchThreadsMesssage,
  updatePrivacy,
  updateSubscriberSettings,
} = require("../controllers/channel/channel");

jest.mock("../services/channelService");
jest.mock("../services/chatService");
jest.mock("../services/messageService");
jest.mock("express-validator");

describe("Channel Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: {id: "user123"},
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
    });
  });

  describe("createChannel", () => {
    it("should create a channel successfully", async () => {
      const createdChannel = {
        _id: "channel123",
        name: "Test Channel",
        description: "Test Description",
      };
      const createdChat = {_id: "chat123"};
      const updatedChat = {_id: "chat123"};
      const createdMessage = {_id: "message123"};

      channelService.createChannel.mockResolvedValue(createdChannel);
      chatService.createChat.mockResolvedValue(createdChat);
      chatService.addParticipant.mockResolvedValue(updatedChat);
      messageService.createMessage.mockResolvedValue(createdMessage);

      req.body = {
        name: "Test Channel",
        description: "Test Description",
        image: "test.png",
      };

      await createChannel(req, res, next);

      expect(channelService.createChannel).toHaveBeenCalledWith({
        name: "Test Channel",
        description: "Test Description",
        image: "test.png",
        ownerId: "user123",
        membersCount: 0,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        channelId: "channel123",
        channelName: "Test Channel",
        channelDescription: "Test Description",
        chatId: "chat123",
      });
    });

    it("should handle validation errors", async () => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{msg: "Name is required"}]),
      });

      await createChannel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith([{message: "Name is required"}]);
    });

    it("should handle errors during channel creation", async () => {
      channelService.createChannel.mockResolvedValue(null);

      await createChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
  describe("updateChannel Controller", () => {
    beforeEach(() => {
      req = {
        params: {channelId: "channel123"},
        body: {
          name: "Updated Channel",
          image: "updatedImage.jpg",
          description: "Updated Description",
        },
        user: {id: "user123"},
      };

      res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      next = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return validation errors if validation fails", async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest
          .fn()
          .mockReturnValue([{type: "field", msg: "Invalid name"}]),
      });

      await updateChannel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        errors: [{errorType: "field", message: "Invalid name"}],
      });
    });

    it("should return 404 if the channel is not found", async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: jest.fn().mockReturnValue(true),
      });

      channelService.getChannelInformation.mockResolvedValue(null);
      chatService.getChatOfChannel.mockResolvedValue(null);

      await updateChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Channel not found. Please check its ID", 404)
      );
    });

    it("should return 403 if the user is not an admin and metadata policy is 'Admins'", async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: jest.fn().mockReturnValue(true),
      });

      const mockUserChannel = {metaDataPolicy: "Admins"};
      const mockChatOfChannel = {
        participants: [{role: "Member", userId: {_id: "user456"}}],
      };

      channelService.getChannelInformation.mockResolvedValue(mockUserChannel);
      chatService.getChatOfChannel.mockResolvedValue(mockChatOfChannel);

      await updateChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("You are not an admin for this channel", 403)
      );
    });

    it("should update the channel and return success response", async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: jest.fn().mockReturnValue(true),
      });

      const mockUserChannel = {
        metaDataPolicy: "EveryOne",
        save: jest.fn().mockResolvedValue(),
        name: "",
        description: "",
        image: "",
      };

      const mockChatOfChannel = {
        save: jest.fn().mockResolvedValue(),
        name: "",
        description: "",
      };

      channelService.getChannelInformation.mockResolvedValue(mockUserChannel);
      chatService.getChatOfChannel.mockResolvedValue(mockChatOfChannel);

      await updateChannel(req, res, next);

      expect(mockUserChannel.save).toHaveBeenCalled();
      expect(mockChatOfChannel.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        channelName: "Updated Channel",
        channelDescription: "Updated Description",
      });
    });

    it("should handle errors and call next with AppError", async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: jest.fn().mockReturnValue(true),
      });

      channelService.getChannelInformation.mockRejectedValue(
        new AppError("An error occurred while updating the channel data")
      );

      await updateChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "An error occurred while updating the channel data",
        })
      );
    });
  });

  describe("deleteChannel", () => {
    beforeEach(() => {
      req = {
        params: {channelId: "testChannelId"},
        user: {id: "testUserId"},
      };
      res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should return 404 if channel is not found", async () => {
      chatService.getChatOfChannel.mockResolvedValue(null);

      await deleteChannel(req, res, next);

      expect(chatService.getChatOfChannel).toHaveBeenCalledWith(
        "testChannelId"
      );
      expect(next).toHaveBeenCalledWith(new AppError("Channel not found", 404));
    });

    it("should return 403 if user is not a participant", async () => {
      chatService.getChatOfChannel.mockResolvedValue({participants: []});

      await deleteChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("You are not a member of this channel", 403)
      );
    });

    it("should delete the channel if user is the creator", async () => {
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: "testUserId", role: "Creator"}],
        _id: "chatId",
      });

      channelService.deleteChannel.mockResolvedValue({deleted: true});
      chatService.softDeleteChat.mockResolvedValue({deleted: true});

      await deleteChannel(req, res, next);

      expect(channelService.deleteChannel).toHaveBeenCalledWith(
        "testChannelId"
      );
      expect(chatService.softDeleteChat).toHaveBeenCalledWith("chatId");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Channel deleted successfully",
      });
    });

    it("should allow user to leave the channel if they are a subscriber or admin", async () => {
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: "testUserId", role: "Admin"}],
        _id: "chatId",
      });

      chatService.removeParticipant.mockResolvedValue(true);

      await deleteChannel(req, res, next);

      expect(chatService.removeParticipant).toHaveBeenCalledWith(
        "chatId",
        "testUserId"
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "You have successfully left the channel",
      });
    });

    it("should return 500 if an error occurs during channel deletion", async () => {
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: "testUserId", role: "Creator"}],
        _id: "chatId",
      });

      channelService.deleteChannel.mockResolvedValue({deleted: false});
      chatService.softDeleteChat.mockResolvedValue({deleted: true});

      await deleteChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("An error occurred while deleting the channel", 500)
      );
    });

    it("should return 500 if an error occurs while leaving the channel", async () => {
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: "testUserId", role: "Admin"}],
        _id: "chatId",
      });

      chatService.removeParticipant.mockResolvedValue(false);

      await deleteChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("An error occurred while leaving the channel", 500)
      );
    });

    it("should return 403 if role is invalid", async () => {
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: "testUserId", role: "Unknown"}],
      });

      await deleteChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Invalid role. Operation not allowed", 403)
      );
    });
  });

  describe("getChannel", () => {
    it("should retrieve channel information successfully", async () => {
      const channelData = {
        _id: "channel123",
        name: "Test Channel",
        description: "Test Description",
        membersCount: 10,
        ownerId: {
          _id: "owner123",
          username: "owner",
          screenName: "Owner Name",
          phone: "123456789",
          picture: "owner.png",
        },
        createdAt: new Date(),
      };

      channelService.getChannelInformation.mockResolvedValue(channelData);
      req.params.channelId = "channel123";

      await getChannel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        channelId: "channel123",
        channelName: "Test Channel",
        channelDescription: "Test Description",
        subscribersCount: 10,
        channelOwner: {
          id: "owner123",
          name: "Owner Name",
          phone: "123456789",
          profilePicture: "owner.png",
        },
        channelCreationDate: channelData.createdAt,
      });
    });

    it("should handle channel not found", async () => {
      channelService.getChannelInformation.mockResolvedValue(null);
      req.params.channelId = "channel123";

      await getChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  // Additional tests for promoteSubscriber, demoteAdmin, joinChannel, and addSubscriber would follow the same pattern.

  describe("promoteSubscriber", () => {
    beforeEach(() => {
      req = {
        params: {channelId: "channel123", subscriberId: "subscriber123"},
        user: {id: "user123"},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should promote a subscriber to admin successfully", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [
          {userId: {_id: "user123"}, role: "Admin"},
          {userId: {_id: "subscriber123"}, role: "Subscriber"},
        ],
      });
      chatService.changeUserRole.mockResolvedValue({
        participants: [
          {userId: {_id: "user123"}, role: "Admin"},
          {userId: {_id: "subscriber123"}, role: "Admin"},
        ],
      });

      await promoteSubscriber(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          participants: [
            {
              userData: {
                id: "user123",
                name: undefined,
                profilePicture: undefined,
                phone: undefined,
              },
              role: "Admin",
            },
            {
              userData: {
                id: "subscriber123",
                name: undefined,
                profilePicture: undefined,
                phone: undefined,
              },
              role: "Admin",
            },
          ],
        },
      });
    });

    it("should throw an error if the channel does not exist", async () => {
      channelService.getChannelInformation.mockResolvedValue(null);

      await promoteSubscriber(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError(
          "Failed to retrieve channel data. Please try again later.",
          500
        )
      );
    });

    it("should throw an error if the chat does not exist", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue(null);

      await promoteSubscriber(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError(
          "Failed to retrieve chat data. Please try again later.",
          500
        )
      );
    });

    it("should throw an error if the user is not an admin or creator", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: {_id: "user123"}, role: "Subscriber"}],
      });

      await promoteSubscriber(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("You do not have the required permissions.", 403)
      );
    });

    it("should throw an error if the target is not found", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: {_id: "user123"}, role: "Admin"}],
      });

      await promoteSubscriber(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("The specified user is not part of this channel.", 404)
      );
    });
    it("should throw an error if the target is Admin or Creator", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [
          {userId: {_id: "user123"}, role: "Admin"},
          {userId: {_id: "subscriber123"}, role: "Admin"},
        ],
      });

      await promoteSubscriber(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("The user is already an admin or creator.", 400)
      );
    });
  });

  describe("demoteAdmin", () => {
    beforeEach(() => {
      req = {
        params: {channelId: "channel123", subscriberId: "subscriber123"},
        user: {id: "user123"},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should demote an admin to a subscriber successfully", async () => {
      // Mock the channel and chat services to return expected data
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [
          {userId: {_id: "user123"}, role: "Admin"},
          {userId: {_id: "subscriber123"}, role: "Admin"},
        ],
      });
      chatService.changeUserRole.mockResolvedValue({
        participants: [
          {userId: {_id: "user123"}, role: "Admin"},
          {userId: {_id: "subscriber123"}, role: "Subscriber"},
        ],
      });

      await demoteAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          participants: [
            {
              userData: {
                id: "user123",
                name: undefined,
                profilePicture: undefined,
                phone: undefined,
              },
              role: "Admin",
            },
            {
              userData: {
                id: "subscriber123",
                name: undefined,
                profilePicture: undefined,
                phone: undefined,
              },
              role: "Subscriber",
            },
          ],
        },
      });
    });

    it("should throw an error if the channel does not exist", async () => {
      channelService.getChannelInformation.mockResolvedValue(null);

      await demoteAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError(
          "Failed to retrieve channel data. Please try again later.",
          500
        )
      );
    });

    it("should throw an error if the chat does not exist", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue(null);

      await demoteAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError(
          "Failed to retrieve chat data. Please try again later.",
          500
        )
      );
    });

    it("should throw an error if the user is not an admin or creator", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: {_id: "user123"}, role: "Subscriber"}],
      });

      await demoteAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("You do not have the required permissions.", 403)
      );
    });

    it("should throw an error if the target is not an admin", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [
          {userId: {_id: "user123"}, role: "Admin"},
          {userId: {_id: "subscriber123"}, role: "Subscriber"},
        ],
      });

      await demoteAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("The user is already a subscriber or creator", 400)
      );
    });

    it("should handle failure when chatService.changeUserRole fails", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [
          {userId: {_id: "user123"}, role: "Admin"},
          {userId: {_id: "subscriber123"}, role: "Admin"},
        ],
      });
      chatService.changeUserRole.mockResolvedValue(null); // Simulating failure

      await demoteAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Failed to update the chat.", 500)
      );
    });
  });

  describe("joinChannel", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      req = {
        params: {channelId: "channel123"},
        user: {id: "user123"},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should successfully join a public channel", async () => {
      // Mock the channel and chat services to return expected data
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
        privacy: true,
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: {_id: "admin123"}, role: "Admin"}],
      });
      chatService.addParticipant.mockResolvedValue(
        new Chat({
          participants: [
            {userId: {_id: "admin123"}, role: "Admin"},
            {userId: {_id: "user123"}, role: "Subscriber"},
          ],
        })
      );

      await joinChannel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          channel: {id: "channel123", privacy: true},
          chat: expect.any(Object),
        },
      });
    });

    it("should throw an error if the channel is private and the user cannot join", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
        privacy: false,
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: {_id: "admin123"}, role: "Admin"}],
      });

      await joinChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("You can't join Private Channel", 401)
      );
    });

    it("should throw an error if the user is already a participant of the channel", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
        privacy: false,
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: {_id: "user123"}, role: "Admin"}],
      });

      await joinChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("User already exists in Channel", 400)
      );
    });

    it("should throw an error if the channel does not exist", async () => {
      channelService.getChannelInformation.mockResolvedValue(null);

      await joinChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Channel not found.", 500)
      );
    });

    it("should throw an error if the chat data cannot be retrieved", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
        privacy: false,
      });
      chatService.getChatOfChannel.mockResolvedValue(null);

      await joinChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError(
          "Failed to retrieve chat data. Please try again later.",
          500
        )
      );
    });

    it("should handle failure when chatService.addParticipant fails", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
        privacy: true,
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: {_id: "admin123"}, role: "Admin"}],
      });
      chatService.addParticipant.mockResolvedValue(null); // Simulating failure

      await joinChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Failed to update the channel's chat.", 500)
      );
    });
  });

  describe("addSubscriber", () => {
    beforeEach(() => {
      req = {
        params: {channelId: "channel123", subscriberId: "user456"},
        user: {id: "user123"},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should successfully add a new subscriber", async () => {
      // Mock the channel and chat services to return expected data
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [
          {userId: {_id: "user123"}, role: "Admin"},
          {userId: {_id: "user789"}, role: "Subscriber"},
        ],
      });
      chatService.addParticipant.mockResolvedValue({
        participants: [
          {userId: {_id: "user123"}, role: "Admin"},
          {userId: {_id: "user789"}, role: "Subscriber"},
          {userId: {_id: "user456"}, role: "Subscriber"},
        ],
      });

      await addSubscriber(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          participants: expect.any(Array),
        },
      });
    });

    it("should throw an error if the user does not have permissions", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: {_id: "user123"}, role: "Subscriber"}],
      });

      await addSubscriber(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("You do not have the required permissions.", 403)
      );
    });

    it("should throw an error if the target subscriber already exists", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [
          {userId: {_id: "user123"}, role: "Admin"},
          {userId: {_id: "user456"}, role: "Subscriber"},
        ],
      });

      await addSubscriber(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Target subscriber already exists", 400)
      );
    });

    it("should throw an error if the channel does not exist", async () => {
      channelService.getChannelInformation.mockResolvedValue(null);

      await addSubscriber(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError(
          "Failed to retrieve channel data. Please try again later.",
          500
        )
      );
    });

    it("should throw an error if the chat data cannot be retrieved", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue(null);

      await addSubscriber(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError(
          "Failed to retrieve chat data. Please try again later.",
          500
        )
      );
    });

    it("should handle failure when chatService.addParticipant fails", async () => {
      channelService.getChannelInformation.mockResolvedValue({
        id: "channel123",
      });
      chatService.getChatOfChannel.mockResolvedValue({
        participants: [{userId: {_id: "user123"}, role: "Admin"}],
      });
      chatService.addParticipant.mockResolvedValue(null); // Simulating failure

      await addSubscriber(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Failed to update the channel's chat.", 500)
      );
    });

    describe("fetchChannelParticipants", () => {
      it("should return transformed participants when data is valid", async () => {
        req.params.channelId = "mockChannelId";

        const mockChat = {
          id: "mockChatId",
          participants: [
            {
              userId: {
                _id: "user1",
                username: "User1",
                picture: "pic1",
                phone: "1234",
              },
              role: "Admin",
              canDownload: true,
            },
            {
              userId: null, // Invalid participant
              role: "Subscriber",
            },
          ],
        };

        jest.spyOn(chatService, "getChatOfChannel").mockResolvedValue(mockChat);
        jest.spyOn(chatService, "checkUserAdmin").mockResolvedValue();

        await fetchChannelParticipants(req, res, next);

        expect(chatService.getChatOfChannel).toHaveBeenCalledWith(
          "mockChannelId"
        );
        expect(chatService.checkUserAdmin).toHaveBeenCalledWith(
          "mockChatId",
          "user123"
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          participants: [
            {
              userData: {
                id: "user1",
                name: "User1",
                profilePicture: "pic1",
                phone: "1234",
                canDownload: true,
              },
              role: "Admin",
            },
          ],
        });
      });
    });

    describe("fetchChannelChat", () => {
      it("should return paginated channel chat with threads", async () => {
        req.params.channelId = "mockChannelId";
        req.query = {page: 2, limit: 10};

        const mockChatResult = {messages: ["message1", "message2"]};
        jest.spyOn(channelService, "checkUserParticipant").mockResolvedValue();
        jest
          .spyOn(channelService, "getChannelChatWithThreads")
          .mockResolvedValue(mockChatResult);

        await fetchChannelChat(req, res, next);

        expect(channelService.checkUserParticipant).toHaveBeenCalledWith(
          "mockChannelId",
          "user123"
        );
        expect(channelService.getChannelChatWithThreads).toHaveBeenCalledWith(
          "mockChannelId",
          2,
          10
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockChatResult);
      });
    });

    describe("fetchThreadsMesssage", () => {
      it("should return paginated thread messages", async () => {
        req.params.postId = "mockPostId";
        req.query = {page: 2, limit: 10};

        const mockMessages = {messages: ["threadMessage1", "threadMessage2"]};
        jest
          .spyOn(channelService, "getThreadMessages")
          .mockResolvedValue(mockMessages);

        await fetchThreadsMesssage(req, res, next);

        expect(channelService.getThreadMessages).toHaveBeenCalledWith(
          "mockPostId",
          "user123",
          2,
          10
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockMessages);
      });
    });

    describe("updatePrivacy", () => {
      beforeEach(() => {
        req = {
          params: {channelId: "123"},
          body: {privacy: "private", comments: true},
          user: {id: "user123"},
        };
        res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
      });

      it("should update channel privacy and return success response", async () => {
        const updatedChannel = {id: "123", privacy: "private", comments: true};
        channelService.updateChannelPrivacy.mockResolvedValue(updatedChannel);

        await updatePrivacy(req, res);

        expect(channelService.updateChannelPrivacy).toHaveBeenCalledWith(
          "123",
          "user123",
          {privacy: "private", comments: true}
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: "Channel updated successfully",
          data: updatedChannel,
        });
      });

      it("should return 404 if channel not found", async () => {
        channelService.updateChannelPrivacy.mockResolvedValue(null);

        await updatePrivacy(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({message: "Channel not found"});
      });
    });

    describe("updateSubscriberSettings", () => {
      beforeEach(() => {
        req = {
          params: {channelId: "123"},
          body: {subscriberId: "subscriber123", download: true},
          user: {id: "user123"},
        };
        res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
      });

      it("should update subscriber permissions successfully", async () => {
        const chatMock = {_id: "chat123"};
        const subscriberMock = {role: "member"};
        const updatedChat = {id: "chat123", permissionsUpdated: true};

        chatService.getChatOfChannel.mockResolvedValue(chatMock);
        chatService.checkUserAdmin.mockResolvedValue(true);
        chatService.checkUserParticipant.mockResolvedValue(subscriberMock);
        chatService.changeParticipantPermission.mockResolvedValue(updatedChat);

        await updateSubscriberSettings(req, res);

        expect(chatService.getChatOfChannel).toHaveBeenCalledWith("123");
        expect(chatService.checkUserAdmin).toHaveBeenCalledWith(
          "chat123",
          "user123"
        );
        expect(chatService.checkUserParticipant).toHaveBeenCalledWith(
          "chat123",
          "subscriber123"
        );
        expect(chatService.changeParticipantPermission).toHaveBeenCalledWith(
          "chat123",
          "subscriber123",
          true
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: "Subscriber permission updated successfully",
          data: updatedChat,
        });
      });

      it("should throw error if subscriber is an Admin or Creator", async () => {
        const chatMock = {_id: "chat123"};
        const subscriberMock = {role: "Admin"};

        chatService.getChatOfChannel.mockResolvedValue(chatMock);
        chatService.checkUserAdmin.mockResolvedValue(true);
        chatService.checkUserParticipant.mockResolvedValue(subscriberMock);

        await expect(updateSubscriberSettings(req, res)).rejects.toThrow(
          "Operation is not allowed for Admin or Creator"
        );
      });

      it("should return 404 if chat is not found", async () => {
        chatService.getChatOfChannel.mockResolvedValue(null);

        await expect(updateSubscriberSettings(req, res)).rejects.toThrow(
          "Chat of Channel is not found"
        );
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });
});
