const {searchForUser} = require("../controllers/searchController");
const userService = require("../services/userService");
const AppError = require("../errors/appError");

// Mocking the userService
jest.mock("../services/userService");

describe("Search Controller Test Suites", () => {
  let req;
  let skip;
  let limit;

  beforeEach(() => {
    req = {
      query: {},
    };
    skip = 0;
    limit = 10;
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
});
