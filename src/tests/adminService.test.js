const mongoose = require("mongoose");
const adminService = require("../services/adminService");
const AppError = require("../errors/appError");
const User = require("../models/user");
const Group = require("../models/groupModel");

jest.mock("../models/user");
jest.mock("../models/groupModel");

describe("adminService Function", () => {
  describe("getUsers", () => {
    it("should throw an error if adminId is invalid", async () => {
      const invalidAdminId = "123";
      await expect(adminService.getUsers(invalidAdminId)).rejects.toThrow(
        new AppError("Invalid adminId provided", 400)
      );
    });

    it("should return users excluding the admin and banned users", async () => {
      const validAdminId = new mongoose.Types.ObjectId();
      const users = [
        {username: "user1", status: "active"},
        {username: "user2", status: "active"},
      ];
      const selectMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(users);
      User.find.mockReturnValue({select: selectMock, exec: execMock});

      const result = await adminService.getUsers(validAdminId);
      expect(result).toEqual(users);
    });

    it("should throw an error if fetching users fails", async () => {
      const validAdminId = new mongoose.Types.ObjectId();
      const selectMock = jest.fn().mockReturnThis();
      const execMock = jest
        .fn()
        .mockRejectedValue(new Error("Error fetching users"));
      User.find.mockReturnValue({select: selectMock, exec: execMock});

      await expect(adminService.getUsers(validAdminId)).rejects.toThrow(
        new AppError("Error fetching users", 500)
      );
    });
  });

  describe("getGroups", () => {
    it("should return groups with owner information", async () => {
      const groups = [
        {
          name: "group1",
          ownerId: {username: "owner1"},
          toObject: function () {
            return this;
          },
        },
      ];
      const selectMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockResolvedValue(groups);
      Group.find.mockReturnValue({
        select: selectMock,
        populate: populateMock,
      });
      const result = await adminService.getGroups();
      delete result[0].toObject;
      expect(result).toEqual([{name: "group1", owner: {username: "owner1"}}]);
    });
  });

  describe("restrictUser", () => {
    it("should throw an error if userId is invalid", async () => {
      const invalidUserId = "123";
      await expect(
        adminService.restrictUser(invalidUserId, {}, {})
      ).rejects.toThrow(new AppError("Invalid userId provided", 400));
    });
    it("should update the user with new data", async () => {
      const validUserId = new mongoose.Types.ObjectId();
      const newData = {status: "restricted"};
      const updatedUser = {username: "user1", status: "restricted"};
      const selectMock = jest.fn().mockResolvedValue(updatedUser);
      User.findByIdAndUpdate.mockReturnValue({select: selectMock});
      const result = await adminService.restrictUser(validUserId, newData, {});
      expect(result).toEqual(updatedUser);
    });
  });
});
