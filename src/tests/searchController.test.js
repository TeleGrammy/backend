const {
  searchForUser,
  searchForGroup,
  searchForChannel,
  searchForMessages,
  globalSearch,
  searchForMatchedContents,
} = require("../controllers/searchController");

const userService = require("../services/userService");
const groupService = require("../services/groupService");
const channelService = require("../services/channelService");
const messageService = require("../services/messageService");

const Message = require("../models/message");

const AppError = require("../errors/appError");

jest.mock("../models/Message");
jest.mock("../services/userService");
jest.mock("../services/groupService");
jest.mock("../services/channelService");
jest.mock("../services/messageService", () => ({
  searchMessages: jest.fn(),
}));

describe("Search Controller Test Suites", () => {
  let req;
  let res;
  let next;
  let skip;
  let limit;

  beforeEach(() => {
    req = {
      body: {
        searchText: "test message",
        mediaType: "image",
        limit: 10,
        skip: 0,
      },
      query: {},
      params: {
        chatId: "12345",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });
  describe("searchForUser Function", () => {
    it("should throw an error if UUID is not provided", async () => {
      req.query.uuid = "";

      await expect(searchForUser(req, skip, limit)).rejects.toThrowError(
        new AppError("UUID is required", 400)
      );
    });

    it("should throw an error if UUID is undefined", async () => {
      req.query.uuid = undefined;

      await expect(searchForUser(req, skip, limit)).rejects.toThrowError(
        new AppError("UUID is required", 400)
      );
    });

    it("should return user data if UUID is valid and user exists", async () => {
      const mockUser = {
        _id: "12345",
        username: "testuser",
        screenName: "Test User",
        email: "testuser@example.com",
        phone: "1234567890",
        picture: "image_url",
        lastSeen: "2024-12-21T12:00:00Z",
      };

      req.query.uuid = "testuser";

      userService.searchUsers.mockResolvedValue(mockUser);

      const result = await searchForUser(req, skip, limit);

      expect(result).toEqual(mockUser);
      expect(userService.searchUsers).toHaveBeenCalledWith(
        {
          $or: [
            {username: {$regex: "testuser", $options: "i"}},
            {screenName: {$regex: "testuser", $options: "i"}},
            {email: {$regex: "testuser", $options: "i"}},
            {phone: {$regex: "testuser", $options: "i"}},
          ],
        },
        "_id username screenName email phone picture lastSeen",
        skip,
        limit
      );
    });

    it("should throw an error if user is not found", async () => {
      req.query.uuid = "nonexistentuser";

      userService.searchUsers.mockResolvedValue(null);

      await expect(searchForUser(req, skip, limit)).rejects.toThrowError(
        new AppError("User not found", 404)
      );
    });

    it("should handle errors thrown by userService.searchUsers", async () => {
      req.query.uuid = "testuser";

      // Mock the userService.searchUsers method to throw an error
      userService.searchUsers.mockRejectedValue(new Error("Database error"));

      await expect(searchForUser(req, skip, limit)).rejects.toThrowError(
        new Error("Database error")
      );
    });
  });

  describe("searchForGroup Function", () => {
    it("should throw an error if group name is not provided", async () => {
      req.query.name = "";

      await expect(searchForGroup(req, skip, limit)).rejects.toThrowError(
        new AppError("UUID is required", 400)
      );
    });

    it("should throw an error if group name is undefined", async () => {
      req.query.name = undefined;

      await expect(searchForGroup(req, skip, limit)).rejects.toThrowError(
        new AppError("UUID is required", 400)
      );
    });

    it("should return group data if name is valid and group exists", async () => {
      const mockGroup = {
        _id: "54321",
        name: "Test Group",
        image: "group_image_url",
        description: "A test group for demonstration",
        chatId: "chat_12345",
        totalMembers: 20,
      };

      req.query.name = "Test Group";

      groupService.searchGroup.mockResolvedValue(mockGroup);

      const result = await searchForGroup(req, skip, limit);

      expect(result).toEqual(mockGroup);
      expect(groupService.searchGroup).toHaveBeenCalledWith(
        {$or: [{name: {$regex: "Test Group", $options: "i"}}]},
        {
          _id: 1,
          name: 1,
          image: 1,
          description: 1,
          chatId: 1,
          totalMembers: {$add: [{$size: "$members"}, {$size: "$admins"}]},
        },
        skip,
        limit
      );
    });

    it("should throw an error if group is not found", async () => {
      req.query.name = "Nonexistent Group";

      groupService.searchGroup.mockResolvedValue(null);

      await expect(searchForGroup(req, skip, limit)).rejects.toThrowError(
        new AppError("Group not found", 404)
      );
    });

    it("should handle errors thrown by groupService.searchGroup", async () => {
      req.query.name = "Test Group";

      groupService.searchGroup.mockRejectedValue(new Error("Database error"));

      await expect(searchForGroup(req, skip, limit)).rejects.toThrowError(
        new Error("Database error")
      );
    });
  });

  describe("searchForChannel Function", () => {
    it("should throw an error if name is not provided", async () => {
      await expect(searchForChannel(req, skip, limit)).rejects.toThrow(
        new AppError("UUID is required", 400)
      );
    });

    it("should throw an error if name is an empty string", async () => {
      req.query.name = "";
      await expect(searchForChannel(req, skip, limit)).rejects.toThrow(
        new AppError("UUID is required", 400)
      );
    });

    it("should return channel data if name is valid and channel exists", async () => {
      const mockChannel = {
        _id: "12345",
        name: "Test Channel",
        imageUrl: "channel_image_url",
        description: "A test channel for demonstration",
        chatId: "chat_54321",
        membersCount: 100,
      };

      req.query.name = "Test Channel";

      channelService.searchChannel.mockResolvedValue(mockChannel);

      const result = await searchForChannel(req, skip, limit);

      expect(result).toEqual(mockChannel);
      expect(channelService.searchChannel).toHaveBeenCalledWith(
        {$or: [{name: {$regex: "Test Channel", $options: "i"}}]},
        {
          _id: 1,
          name: 1,
          imageUrl: 1,
          description: 1,
          chatId: 1,
          membersCount: 1,
        },
        skip,
        limit
      );
    });

    it("should throw an error if no channel is found", async () => {
      req.query.name = "Nonexistent Channel";

      channelService.searchChannel.mockResolvedValue(null);

      await expect(searchForChannel(req, skip, limit)).rejects.toThrow(
        new AppError("Channel not found", 404)
      );
    });
  });

  describe("searchForMessages Function", () => {
    it("should throw an error if message is not provided", async () => {
      await expect(searchForMessages(req, skip, limit)).rejects.toThrow(
        new AppError("Message is required", 400)
      );
    });

    it("should throw an error if message is an empty string", async () => {
      req.query.message = "";
      await expect(searchForMessages(req, skip, limit)).rejects.toThrow(
        new AppError("Message is required", 400)
      );
    });

    it("should return filtered and mapped messages if valid data is provided", async () => {
      const mockDocs = [
        {
          _id: "1",
          chatId: {
            _id: "chat1",
            groupId: {
              _id: "group1",
              name: "Group 1",
              image: "group1.jpg",
              groupType: "Public",
            },
            channelId: null,
          },
          messageType: "text",
          content: "Hello, this is a test message",
          mediaUrl: null,
          timestamp: "2024-12-21T10:00:00Z",
        },
        {
          _id: "2",
          chatId: {
            _id: "chat2",
            groupId: null,
            channelId: {
              _id: "channel1",
              name: "Channel 1",
              imageUrl: "channel1.jpg",
              privacy: true,
            },
          },
          messageType: "image",
          content: "A test image message",
          mediaUrl: "image.jpg",
          timestamp: "2024-12-21T11:00:00Z",
        },
      ];

      const expectedResult = [
        {
          _id: "1",
          chatId: "chat1",
          groupId: "group1",
          channelId: undefined,
          groupName: "Group 1",
          channelName: undefined,
          groupImage: "group1.jpg",
          channelImage: undefined,
          messageType: "text",
          content: "Hello, this is a test message",
          mediaUrl: null,
          timestamp: "2024-12-21T10:00:00Z",
        },
        {
          _id: "2",
          chatId: "chat2",
          groupId: undefined,
          channelId: "channel1",
          groupName: undefined,
          channelName: "Channel 1",
          groupImage: undefined,
          channelImage: "channel1.jpg",
          messageType: "image",
          content: "A test image message",
          mediaUrl: "image.jpg",
          timestamp: "2024-12-21T11:00:00Z",
        },
      ];

      req.query.message = "test";
      messageService.searchMessages.mockResolvedValue(mockDocs);

      const result = await searchForMessages(req, skip, limit);

      expect(result).toEqual(expectedResult);
      expect(messageService.searchMessages).toHaveBeenCalledWith(
        {$or: [{content: {$regex: "test", $options: "i"}}]},
        {
          _id: 1,
          chatId: 1,
          messageType: 1,
          content: 1,
          mediaUrl: 1,
          timestamp: 1,
        },
        skip,
        limit,
        [
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
        ]
      );
    });

    it("should return an empty array if no messages match the filter criteria", async () => {
      req.query.message = "noMatch";
      messageService.searchMessages.mockResolvedValue([]);

      const result = await searchForMessages(req, skip, limit);

      expect(result).toEqual([]);
      expect(messageService.searchMessages).toHaveBeenCalledWith(
        {$or: [{content: {$regex: "noMatch", $options: "i"}}]},
        {
          _id: 1,
          chatId: 1,
          messageType: 1,
          content: 1,
          mediaUrl: 1,
          timestamp: 1,
        },
        skip,
        limit,
        [
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
        ]
      );
    });
  });

  describe("globalSearch Function", () => {
    //     const searchController = require("../controllers/searchController");
    //     beforeEach(() => {
    //       jest.spyOn(searchController, "searchForUser").mockResolvedValue([]);
    //       jest.spyOn(searchController, "searchForGroup").mockResolvedValue([]);
    //       jest.spyOn(searchController, "searchForChannel").mockResolvedValue([]);
    //       jest.spyOn(searchController, "searchForMessages").mockResolvedValue([]);
    //     });
    //     afterEach(() => {
    //       jest.restoreAllMocks();
    //     });
    //     it("should throw an error if type is not provided", async () => {
    //       await globalSearch(req, res, next);
    //       expect(next).toHaveBeenCalledWith(new AppError("Type is required", 400));
    //     });
    //     it("should throw an error if type is invalid", async () => {
    //       req.query.type = "invalidType";
    //       await globalSearch(req, res, next);
    //       expect(next).toHaveBeenCalledWith(new AppError("Invalid type", 400));
    //     });
    //     it('should return users if type is "user"', async () => {
    //       req.query.type = "user";
    //       req.query.page = "1";
    //       req.query.limit = "10";
    //       const mockUsers = [{id: 1, name: "User1"}];
    //       searchController.searchForUser.mockResolvedValue(mockUsers);
    //       console.log("hey:", req);
    //       await globalSearch(req, res, next);
    //       console.log("after");
    //       expect(searchController.searchForUser).toHaveBeenCalledWith(req, 0, 10);
    //       expect(res.status).toHaveBeenCalledWith(200);
    //       expect(res.json).toHaveBeenCalledWith({
    //         status: "success",
    //         page: 1,
    //         limit: 10,
    //         totalDocs: mockUsers.length,
    //         data: {user: mockUsers},
    //       });
    //     });
    //     it('should return groups if type is "group"', async () => {
    //       req.query.type = "group";
    //       req.query.page = "2";
    //       req.query.limit = "5";
    //       const mockGroups = [{id: 1, name: "Group1"}];
    //       searchController.searchForGroup.mockResolvedValue(mockGroups);
    //       await globalSearch(req, res, next);
    //       expect(searchController.searchForGroup).toHaveBeenCalledWith(req, 5, 5);
    //       expect(res.status).toHaveBeenCalledWith(200);
    //       expect(res.json).toHaveBeenCalledWith({
    //         status: "success",
    //         page: 2,
    //         limit: 5,
    //         totalDocs: mockGroups.length,
    //         data: {group: mockGroups},
    //       });
    //     });
    //     it('should return channels if type is "channel"', async () => {
    //       req.query.type = "channel";
    //       req.query.page = "1";
    //       req.query.limit = "20";
    //       const mockChannels = [{id: 1, name: "Channel1"}];
    //       searchController.searchForChannel.mockResolvedValue(mockChannels);
    //       await globalSearch(req, res, next);
    //       expect(searchController.searchForChannel).toHaveBeenCalledWith(
    //         req,
    //         0,
    //         20
    //       );
    //       expect(res.status).toHaveBeenCalledWith(200);
    //       expect(res.json).toHaveBeenCalledWith({
    //         status: "success",
    //         page: 1,
    //         limit: 20,
    //         totalDocs: mockChannels.length,
    //         data: {channel: mockChannels},
    //       });
    //     });
    //     it('should return messages if type is "message"', async () => {
    //       req.query.type = "message";
    //       req.query.page = "3";
    //       req.query.limit = "15";
    //       const mockMessages = [{id: 1, content: "Message1"}];
    //       searchController.searchForMessages.mockResolvedValue(mockMessages);
    //       await globalSearch(req, res, next);
    //       expect(searchController.searchForMessages).toHaveBeenCalledWith(
    //         req,
    //         30,
    //         15
    //       );
    //       expect(res.status).toHaveBeenCalledWith(200);
    //       expect(res.json).toHaveBeenCalledWith({
    //         status: "success",
    //         page: 3,
    //         limit: 15,
    //         totalDocs: mockMessages.length,
    //         data: {message: mockMessages},
    //       });
    //     });
  });

  describe("searchForMatchedText", () => {
    it("should return a success response when searchMessages is successful", async () => {
      const mockResults = [{id: 1, content: "test message"}];
      Message.searchMessages.mockResolvedValue(mockResults);

      await searchForMatchedContents(req, res, next);

      expect(Message.searchMessages).toHaveBeenCalledWith({
        messageType: req.body.mediaType,
        chatId: req.params.chatId,
        searchText: req.body.searchText,
        limit: req.body.limit,
        skip: req.body.skip,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {message: mockResults},
      });
    });

    it("should call next with an error if searchMessages throws an error", async () => {
      const mockError = new AppError("Missing required parameters");
      Message.searchMessages.mockRejectedValue(mockError);

      await searchForMatchedContents(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });

    it("should handle missing parameters in the request body", async () => {
      req.body = {};

      await searchForMatchedContents(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError("Missing required parameters", 400)
      );
    });
  });
});
