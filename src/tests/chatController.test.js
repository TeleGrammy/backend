/* eslint-disable no-undef */
const chatController = require("../controllers/chat/chat");
const chatService = require("../services/chatService");
const userService = require("../services/userService");
const messageServices = require("../services/messageService");
const groupServices = require("../services/groupService");
const AppError = require("../errors/appError");

jest.mock("../services/chatService");
jest.mock("../services/userService");
jest.mock("../services/messageService");
jest.mock("../services/groupService");

describe("chatController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      user: {id: "mockUserId"},
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

  // -------- Tests for getChat --------
  describe("getChat", () => {
    beforeEach(() => {
      req = {
        query: {},
        params: {},
        body: {},
        user: {id: "mockUserId"},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });
    beforeEach(() => {
      jest.clearAllMocks(); // Clears call history for all mocks
    });
    it("should return 400 if receiver query parameter is missing", async () => {
      await chatController.getChat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Receiver UUID is required.",
      });
    });

    it("should return 404 if the receiver user is not found", async () => {
      req.query.receiver = "nonexistentReceiverUUID";
      userService.getUserByUUID.mockResolvedValue(null);

      await chatController.getChat(req, res, next);

      expect(userService.getUserByUUID).toHaveBeenCalledWith(
        "nonexistentReceiverUUID"
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Receiver not found.",
      });
    });

    it("should return 200 with chat data when a chat is successfully created", async () => {
      req.query.receiver = "validReceiverUUID";
      const mockReceiverUser = {id: "receiverUserId", username: "Receiver"};
      const mockChat = {
        id: "chatId",
        participants: ["mockUserId", "receiverUserId"],
      };

      userService.getUserByUUID.mockResolvedValue(mockReceiverUser);
      chatService.createOneToOneChat.mockResolvedValue(mockChat);

      await chatController.getChat(req, res, next);

      expect(userService.getUserByUUID).toHaveBeenCalledWith(
        "validReceiverUUID"
      );
      expect(chatService.createOneToOneChat).toHaveBeenCalledWith(
        "mockUserId",
        "receiverUserId"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockChat);
    });

    it("should call next with an error if an exception occurs", async () => {
      req.query.receiver = "validReceiverUUID";
      const mockError = new Error("Some error");

      userService.getUserByUUID.mockRejectedValue(mockError);

      await chatController.getChat(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  // -------- Tests for getChatById --------
  describe("getChatById", () => {
    it("should return 400 if the chat ID is undefined", async () => {
      req.params.id = "undefined";

      await chatController.getChatById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should return 404 if the chat is not found", async () => {
      req.params.id = "validChatId";
      chatService.getChatById.mockResolvedValue(null);

      await chatController.getChatById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Chat not found",
          statusCode: 404,
        })
      );
    });

    it("should return 401 if the user is not a participant in the chat", async () => {
      req.params.id = "validChatId";
      const mockChat = {
        participants: [{userId: {_id: "notDefiend"}}],
      };

      chatService.getChatById.mockResolvedValue(mockChat);

      await chatController.getChatById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You are not authorized to access this chat",
          statusCode: 401,
        })
      );
    });

    it("should return 200 with chat and messages when successful", async () => {
      req.params.id = "validChatId";
      req.query.page = 1;
      req.query.limit = 10;

      const mockChat = {
        participants: [{userId: {_id: "mockUserId"}}],
        isGroup: false,
      };
      const mockMessages = [{id: "message1"}, {id: "message2"}];
      chatService.getChatById.mockResolvedValue(mockChat);
      messageServices.fetchChatMessages.mockResolvedValue(mockMessages);
      messageServices.countChatMessages.mockResolvedValue(2);
      await chatController.getChatById(req, res, next);
      console.log("After Method");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        chat: mockChat,
        messages: {
          totalMessages: 2,
          currentPage: 1,
          totalPages: 1,
          data: mockMessages,
        },
      });
    });

    it("should return 200 with Group chat and messages when successful", async () => {
      req.params.id = "validChatId";
      req.query.page = 1;
      req.query.limit = 10;

      const mockChat = {
        participants: [{userId: {_id: "mockUserId"}}],
        isGroup: true,
      };
      const mockMessages = [{id: "message1"}, {id: "message2"}];
      const mockGroup = {
        members: [{memberId: "mockUserId", leftAt: "2024-12-01T10:00:00Z"}],
        admins: [],
      };

      groupServices.findGroupById.mockResolvedValue(mockGroup);
      chatService.getChatById.mockResolvedValue(mockChat);
      messageServices.fetchChatMessages.mockResolvedValue(mockMessages);
      messageServices.countChatMessages.mockResolvedValue(2);
      await chatController.getChatById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        chat: mockChat,
        messages: {
          totalMessages: 2,
          currentPage: 1,
          totalPages: 1,
          data: mockMessages,
        },
      });
    });

    it("should return 401 if user is not authorized in a group chat", async () => {
      const mockChat = {
        isGroup: true,
        groupId: "groupId",
        participants: [{userId: {_id: "mockUserId"}}],
      };
      const mockGroup = {members: [{id: "notExist"}], admins: []};

      chatService.getChatById.mockResolvedValue(mockChat);
      groupServices.findGroupById.mockResolvedValue(mockGroup);

      await chatController.getChatById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You are not authorized to access this chat",
          statusCode: 401,
        })
      );
    });

    it("should apply timestamp filter if user left the group", async () => {
      req.params.id = "validChatId";
      req.query.page = 1;
      req.query.limit = 10;
      const mockChat = {
        id: "validChatId",
        isGroup: true,
        groupId: "groupId",
        participants: [{userId: {_id: "mockUserId"}}],
      };
      const mockGroup = {
        members: [],
        admins: [{adminId: "mockUserId", leftAt: "2024-12-01T10:00:00Z"}],
      };

      chatService.getChatById.mockResolvedValue(mockChat);
      groupServices.findGroupById.mockResolvedValue(mockGroup);
      messageServices.fetchChatMessages.mockResolvedValue([]);
      messageServices.countChatMessages.mockResolvedValue(0);

      await chatController.getChatById(req, res, next);

      expect(messageServices.fetchChatMessages).toHaveBeenCalledWith(
        "validChatId",
        {chatId: "validChatId", timestamp: {$gte: "2024-12-01T10:00:00Z"}},
        0,
        10
      );
    });
  });

  // -------- Tests for getAllChats --------
  describe("getAllChats", () => {
    it("should return paginated chats with user chats", async () => {
      req.query.page = 1;
      req.query.limit = 10;

      const mockChat = {
        _id: "validChatId",
        participants: [
          {
            userId: {
              _id: "mockUserId",
              username: "mockUser",
              email: "mock@example.com",
              picture: "mockImage.jpg",
              status: "online",
              lastSeen: "2024-12-20T12:00:00Z",
            },
            joinedAt: "2024-12-01T12:00:00Z",
            role: "admin",
            draft_message: "Hello",
          },
          {
            userId: {
              _id: "otherUserId",
              username: "otherUser",
              email: "other@example.com",
              picture: "otherImage.jpg",
              status: "offline",
              lastSeen: "2024-12-19T12:00:00Z",
            },
            joinedAt: "2024-12-01T12:00:00Z",
            role: "user",
            draft_message: "Hi there!",
          },
        ],
        lastMessage: {
          text: "Hello, how are you?",
          timestamp: "2024-12-20T12:00:00Z",
        },
        groupId: {
          _id: "groupId",
          name: "Test Group",
          image: "groupImage.jpg",
          description: "This is a test group.",
        },
        channelId: {
          _id: "channelId",
          name: "Test Channel",
          image: "channelImage.jpg",
          description: "This is a test channel.",
        },
        isGroup: false,
        isChannel: false,
      };
      const mockGroupChat = {
        _id: "groupChatId",
        participants: [
          {
            userId: {
              _id: "mockUserId",
              username: "mockUser",
              email: "mock@example.com",
              picture: "mockUserImage.jpg",
              status: "online",
              lastSeen: "2024-12-20T10:00:00Z",
            },
            joinedAt: "2024-12-01T10:00:00Z",
            role: "admin",
            draft_message: "Group draft message from mockUser",
          },
          {
            userId: {
              _id: "otherUserId",
              username: "otherUser",
              email: "other@example.com",
              picture: "otherUserImage.jpg",
              status: "offline",
              lastSeen: "2024-12-19T18:00:00Z",
            },
            joinedAt: "2024-12-01T10:00:00Z",
            role: "member",
          },
        ],
        groupId: {
          _id: "testGroupId",
          name: "Test Group Chat",
          image: "groupImage.jpg",
          description: "This is a test group chat for users.",
        },
        lastMessage: {
          text: "Welcome to the group!",
          timestamp: "2024-12-20T09:30:00Z",
        },
        isGroup: true,
        isChannel: false,
      };
      const mockChannelChat = {
        _id: "channelChatId",
        participants: [
          {
            userId: {
              _id: "mockUserId",
              username: "mockUser",
              email: "mock@example.com",
              picture: "mockUserImage.jpg",
              status: "online",
              lastSeen: "2024-12-20T10:00:00Z",
            },
            joinedAt: "2024-12-01T10:00:00Z",
            role: "subscriber",
            draft_message: "Channel draft message from mockUser",
            canDownload: true,
          },
        ],
        channelId: {
          _id: "testChannelId",
          name: "Test Channel Chat",
          image: "channelImage.jpg",
          description: "This is a test channel for announcements.",
        },
        lastMessage: {
          text: "Latest announcement: Happy holidays!",
          timestamp: "2024-12-20T09:45:00Z",
        },
        isGroup: false,
        isChannel: true,
      };

      const mockChats = [mockChat, mockGroupChat, mockChannelChat];
      const totalChats = 3;

      chatService.getUserChats.mockResolvedValue(mockChats);
      chatService.countUserChats.mockResolvedValue(totalChats);

      await chatController.getAllChats(req, res, next);

      console.log("AFTER TEST");
      expect(chatService.getUserChats).toHaveBeenCalledWith(
        "mockUserId",
        0,
        10
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        userId: "mockUserId",
        totalChats,
        currentPage: 1,
        totalPages: 1,
        chats: expect.any(Array),
      });
    });
  });

  // -------- Tests for fetchContacts --------
  describe("fetchContacts", () => {
    it("should return 400 if contacts are missing or not an array", async () => {
      req.body.contacts = null;

      await chatController.fetchContacts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Contacts are required as a non-empty array.",
      });
    });

    it("should return created chats for valid contacts", async () => {
      req.body.contacts = ["validContactUUID"];
      const mockContactUser = {id: "contactUserId"};
      const mockChat = {id: "chatId"};

      userService.getUserByUUID.mockResolvedValue(mockContactUser);
      chatService.createOneToOneChat.mockResolvedValue(mockChat);

      await chatController.fetchContacts(req, res, next);

      expect(userService.getUserByUUID).toHaveBeenCalledWith(
        "validContactUUID"
      );
      expect(chatService.createOneToOneChat).toHaveBeenCalledWith(
        "mockUserId",
        "contactUserId"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        chats: ["chatId"],
        chatCount: 1,
      });
    });
    it("Search for non exist Contact", async () => {
      req.body.contacts = ["NotExistContact"];
      const mockContactUser = null;
      const mockChat = null;

      userService.getUserByUUID.mockResolvedValue(mockContactUser);
      chatService.createOneToOneChat.mockResolvedValue(mockChat);

      await chatController.fetchContacts(req, res, next);

      expect(userService.getUserByUUID).toHaveBeenCalledWith("NotExistContact");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        chats: [],
        chatCount: 0,
      });
    });
  });
});
