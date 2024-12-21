/* eslint-disable no-undef */

const mongoose = require("mongoose");
const {
  createChannel,
  deleteChannel,
  getChannelInformation,
  getChannelChatWithThreads,
  getThreadMessages,
  checkUserParticipant,
  checkCommentEnable,
  updateChannelPrivacy,
} = require("../services/channelService");
const ChatService = require("../services/chatService");
const Channel = require("../models/channel");
const Message = require("../models/message");

jest.mock("../models/channel");
jest.mock("../models/message");
jest.mock("../services/chatService");

describe("Channel Service", () => {
  beforeEach(() => {
    const mockPopulate = jest.fn().mockResolvedValue({
      _id: "validChannelId",
      name: "Test Channel",
      comments: true,
    });

    Channel.findOne = jest.fn().mockReturnValue({
      populate: mockPopulate,
    });

    const mockSkip = jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue([
        {_id: "message1", content: "Message 1"},
        {_id: "message2", content: "Message 2"},
      ]),
    });

    const mockSort = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([
          {_id: "message1", content: "Thread Message 1"},
          {_id: "message2", content: "Thread Message 2"},
        ]),
      }),
    });

    Message.find = jest.fn().mockReturnValue({
      skip: mockSkip,
      sort: mockSort,
    });
    Message.countDocuments = jest.fn().mockResolvedValue(50);
  });
  describe("createChannel", () => {
    it("should create a new channel and save it", async () => {
      const channelData = {name: "Test Channel", ownerId: "user123"};
      const savedChannel = {id: "channel123", ...channelData};
      Channel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedChannel),
      }));

      const result = await createChannel(channelData);

      expect(result).toEqual(savedChannel);
    });
  });

  describe("getChannelInformation", () => {
    it("should return channel information if valid channelId is provided", async () => {
      const channelId = new mongoose.Types.ObjectId();
      const mockPopulate = jest.fn().mockResolvedValue({
        _id: channelId,
        name: "Test Channel",
        ownerId: {_id: "ownerId123", name: "Owner Name"},
      });

      Channel.findOne = jest.fn().mockReturnValue({
        populate: mockPopulate,
      });
      const channelInfo = await getChannelInformation(channelId);

      expect(Channel.findOne).toHaveBeenCalledWith({_id: channelId});
      expect(mockPopulate).toHaveBeenCalledWith(
        "ownerId",
        "username email phone screenName picture lastSeenVisibility status lastSeen"
      );
      expect(channelInfo).toEqual({
        _id: channelId,
        name: "Test Channel",
        ownerId: {_id: "ownerId123", name: "Owner Name"},
      });
    });

    it("should throw an error if invalid channelId is provided", async () => {
      await expect(getChannelInformation("invalidChannelId")).rejects.toThrow(
        "Invalid channelId provided"
      );
    });
  });

  describe("deleteChannel", () => {
    it("should mark the channel as deleted", async () => {
      const channelId = new mongoose.Types.ObjectId();

      const updatedChannel = {id: channelId, deleted: true};
      Channel.findOneAndUpdate.mockResolvedValue(updatedChannel);

      const result = await deleteChannel(channelId);
      expect(result).toEqual(updatedChannel);
    });
  });

  describe("updateChannelPrivacy", () => {
    it("should update channel privacy if user is admin", async () => {
      const id = new mongoose.Types.ObjectId();

      const userId = "user123";
      const updateData = {privacy: "private"};
      const chat = {id: "chat123"};
      const updatedChannel = {id, ...updateData};

      ChatService.getChatOfChannel.mockResolvedValue(chat);
      ChatService.checkUserAdmin.mockResolvedValue(true);
      Channel.findByIdAndUpdate.mockResolvedValue(updatedChannel);

      const result = await updateChannelPrivacy(id, userId, updateData);
      expect(result).toEqual(updatedChannel);
    });
  });

  describe("getChannelChatWithThreads", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return channel chat details with threads if all data exists", async () => {
      // Mock data
      const mockChannelId = "mockChannelId";
      const mockChatId = "mockChatId";
      const mockMessages = [
        {_id: "message1", content: "Message 1"},
        {_id: "message2", content: "Message 2"},
      ];
      const mockChannel = {
        _id: mockChannelId,
        name: "Test Channel",
        description: "Test Description",
      };
      const mockChat = {
        _id: mockChatId,
      };

      // Mock implementations
      Channel.findById.mockResolvedValue(mockChannel);
      ChatService.getChatOfChannel.mockResolvedValue(mockChat);

      Message.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockMessages),
        }),
      });

      Message.countDocuments.mockResolvedValue(50);

      // Call the function
      const result = await getChannelChatWithThreads(mockChannelId, 1, 10);

      // Assertions
      expect(Channel.findById).toHaveBeenCalledWith(mockChannelId);
      expect(ChatService.getChatOfChannel).toHaveBeenCalledWith(mockChannelId);
      expect(Message.find).toHaveBeenCalledWith({
        chatId: mockChatId,
        isPost: true,
      });
      expect(Message.countDocuments).toHaveBeenCalledWith({
        chatId: mockChatId,
        isPost: true,
      });

      expect(result).toEqual({
        channelId: mockChannel._id,
        channelName: mockChannel.name,
        channelDescription: mockChannel.description,
        chatId: mockChat._id,
        messages: mockMessages,
        pagination: {
          totalMessages: 50,
          totalPages: 5,
          currentPage: 1,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      });
    });

    it("should throw an error if the channel is not found", async () => {
      Channel.findById.mockResolvedValue(null);

      await expect(
        getChannelChatWithThreads("invalidChannelId")
      ).rejects.toThrow("Error fetching channel chat: Channel not found");

      expect(Channel.findById).toHaveBeenCalledWith("invalidChannelId");
    });

    it("should throw an error if the chat is not found", async () => {
      Channel.findById.mockResolvedValue({_id: "mockChannelId"});
      ChatService.getChatOfChannel.mockResolvedValue(null);

      await expect(getChannelChatWithThreads("mockChannelId")).rejects.toThrow(
        "Error fetching channel chat: Channel Chat not found, Try again later"
      );

      expect(ChatService.getChatOfChannel).toHaveBeenCalledWith(
        "mockChannelId"
      );
    });

    it("should handle errors and throw a descriptive error message", async () => {
      Channel.findById.mockRejectedValue(new Error("Database error"));

      await expect(getChannelChatWithThreads("mockChannelId")).rejects.toThrow(
        "Error fetching channel chat: Database error"
      );
    });
  });

  describe("getThreadMessages", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return thread messages with pagination if the thread exists and the user is a participant", async () => {
      // Mock data
      const mockPostId = "mockPostId";
      const mockUserId = "mockUserId";
      const mockChatId = "mockChatId";
      const mockMessages = [
        {_id: "message1", content: "Message 1"},
        {_id: "message2", content: "Message 2"},
      ];
      const mockPost = {
        _id: mockPostId,
        chatId: {_id: mockChatId},
      };

      // Mock implementations
      Message.findById.mockResolvedValue(mockPost);
      ChatService.checkUserParticipant.mockResolvedValue(true);

      Message.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockMessages),
          }),
        }),
      });

      Message.countDocuments.mockResolvedValue(50);

      // Call the function
      const result = await getThreadMessages(mockPostId, mockUserId, 1, 10);

      // Assertions
      expect(Message.findById).toHaveBeenCalledWith(mockPostId);
      expect(ChatService.checkUserParticipant).toHaveBeenCalledWith(
        mockChatId,
        mockUserId
      );
      expect(Message.find).toHaveBeenCalledWith({
        chatId: mockChatId,
        parentPost: mockPostId,
        isPost: false,
      });
      expect(Message.countDocuments).toHaveBeenCalledWith({
        parentPost: mockPostId,
      });

      expect(result).toEqual({
        messages: mockMessages,
        pagination: {
          totalMessages: 50,
          totalPages: 5,
          currentPage: 1,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      });
    });

    it("should throw an error if the thread is not found", async () => {
      Message.findById.mockResolvedValue(null);

      await expect(
        getThreadMessages("invalidPostId", "mockUserId")
      ).rejects.toThrow("Thread not found");

      expect(Message.findById).toHaveBeenCalledWith("invalidPostId");
    });

    it("should throw an error if the user is not a participant in the chat", async () => {
      const mockPost = {
        _id: "mockPostId",
        chatId: {_id: "mockChatId"},
      };

      Message.findById.mockResolvedValue(mockPost);
      ChatService.checkUserParticipant.mockRejectedValue(
        new Error("User is not a participant")
      );

      await expect(
        getThreadMessages("mockPostId", "mockUserId")
      ).rejects.toThrow("User is not a participant");

      expect(ChatService.checkUserParticipant).toHaveBeenCalledWith(
        "mockChatId",
        "mockUserId"
      );
    });

    it("should handle errors and throw a descriptive error message", async () => {
      Message.findById.mockRejectedValue(new Error("Database error"));

      await expect(
        getThreadMessages("mockPostId", "mockUserId")
      ).rejects.toThrow("Database error");
    });
  });

  describe("checkUserParticipant", () => {
    it("should return the user if they are a participant", async () => {
      const channelId = new mongoose.Types.ObjectId();
      const userId = "user123";
      const chat = {participants: [{userId: {_id: "user123"}}]};

      ChatService.getChatOfChannel.mockResolvedValue(chat);

      const result = await checkUserParticipant(channelId, userId);

      expect(result).toEqual(chat.participants[0]);
    });

    it("should throw an error if the user is not a participant", async () => {
      const channelId = new mongoose.Types.ObjectId();
      const userId = "user123";
      const chat = {participants: []};

      ChatService.getChatOfChannel.mockResolvedValue(chat);

      await expect(checkUserParticipant(channelId, userId)).rejects.toThrow(
        "User not found in the channel participants"
      );
    });
  });

  describe("checkCommentEnable", () => {
    it("should return comment status if channel exists", async () => {
      const channelId = new mongoose.Types.ObjectId();

      const commentStatus = await checkCommentEnable(channelId);
      const mockPopulate = jest.fn().mockResolvedValue({
        _id: "validChannelId",
        name: "Test Channel",
        comments: true,
      });

      Channel.findOne = jest.fn().mockReturnValue({
        populate: mockPopulate,
      });
      expect(commentStatus).toBe(true);
    });

    it("should throw an error if channel does not exist", async () => {
      const channelId = new mongoose.Types.ObjectId();
      const mockPopulate = jest.fn().mockResolvedValue(null);

      Channel.findOne = jest.fn().mockReturnValue({
        populate: mockPopulate,
      });
      await expect(checkCommentEnable(channelId)).rejects.toThrow(
        "Channl not Found"
      );
    });
  });
});
