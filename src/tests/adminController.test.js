const chai = require("chai");
const sinon = require("sinon");
const {expect} = chai;

const catchAsync = require("../utils/catchAsync");
const AppError = require("../errors/appError");
const adminService = require("../services/adminService");
const groupService = require("../services/groupService");
const {
  getRegisteredUsers,
  getCurrentGroups,
  changeUserStatus,
  applyFilterContents,
} = require("../controllers/admin/admin");

describe("Admin Controller Test Suites", () => {
  let req, res, next, sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      user: {id: "validAdminId"},
      params: {},
      body: {},
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("getRegisteredUsers Function", () => {
    it("should return registered users successfully", async () => {
      const mockUsers = [
        {username: "user1", status: "active"},
        {username: "user2", status: "inactive"},
      ];

      sandbox.stub(adminService, "getUsers").resolves(mockUsers);

      await getRegisteredUsers(req, res, next);

      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          status: "success",
          data: mockUsers,
        })
      ).to.be.true;
    });

    it("should handle invalid admin ID error", async () => {
      sandbox
        .stub(adminService, "getUsers")
        .throws(new AppError("Invalid adminId provided", 400));

      await getRegisteredUsers(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.be.instanceOf(AppError);
      expect(error.message).to.equal("Invalid adminId provided");
      expect(error.statusCode).to.equal(400);
    });

    it("should handle unexpected errors", async () => {
      const unexpectedError = new AppError("Unexpected error");
      sandbox.stub(adminService, "getUsers").throws(unexpectedError);

      await getRegisteredUsers(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.equal(unexpectedError);
    });
  });

  describe("applyFilterContents Function", () => {
    it("should successfully update the group's filtering status", async () => {
      req.params.groupId = "validGroupId";
      req.body.applyFilter = true;

      const mockUpdatedGroup = {
        _id: "validGroupId",
        groupPermissions: {applyFilter: true},
      };

      sandbox
        .stub(groupService, "findAndUpdateGroup")
        .resolves(mockUpdatedGroup);

      await applyFilterContents(req, res, next);

      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          status: "success",
          message: "Group's filtering status has been updated",
        })
      ).to.be.true;
      expect(next.called).to.be.false;
    });

    it("should handle invalid groupId", async () => {
      req.params.groupId = "invalidGroupId";
      req.body.applyFilter = true;

      sandbox
        .stub(groupService, "findAndUpdateGroup")
        .throws(new AppError("Invalid groupdId provided", 400));

      await applyFilterContents(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.be.instanceOf(AppError);
      expect(error.message).to.equal("Invalid groupdId provided");
      expect(error.statusCode).to.equal(400);
    });

    it("should handle case where group is not updated", async () => {
      req.params.groupId = "validGroupId";
      req.body.applyFilter = true;

      sandbox.stub(groupService, "findAndUpdateGroup").resolves(null);

      await applyFilterContents(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.be.instanceOf(AppError);
      expect(error.message).to.equal(
        "An error occurred while updating the group"
      );
      expect(error.statusCode).to.equal(500);
    });

    it("should handle unexpected errors", async () => {
      req.params.groupId = "validGroupId";
      req.body.applyFilter = true;

      const unexpectedError = new Error("Unexpected error");
      sandbox.stub(groupService, "findAndUpdateGroup").throws(unexpectedError);

      await applyFilterContents(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.equal(unexpectedError);
    });
  });

  describe("getCurrentGroups Function", () => {
    it("should return current groups successfully", async () => {
      const mockGroups = [
        {
          name: "Group 1",
          description: "Description 1",
          image: "image1.jpg",
          groupType: "public",
          groupPermissions: [],
          owner: {
            username: "owner1",
            screenName: "Owner One",
            phone: "1234567890",
            email: "owner1@example.com",
            _id: "ownerId1",
          },
        },
        {
          name: "Group 2",
          description: "Description 2",
          image: "image2.jpg",
          groupType: "private",
          groupPermissions: [],
          owner: {
            username: "owner2",
            screenName: "Owner Two",
            phone: "0987654321",
            email: "owner2@example.com",
            _id: "ownerId2",
          },
        },
      ];

      sandbox.stub(adminService, "getGroups").resolves(mockGroups);

      await getCurrentGroups(req, res, next);

      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          status: "success",
          data: mockGroups,
        })
      ).to.be.true;
    });

    it("should handle errors thrown by the service", async () => {
      const unexpectedError = new Error("Unexpected error");
      sandbox.stub(adminService, "getGroups").throws(unexpectedError);

      await getCurrentGroups(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.equal(unexpectedError);
    });
  });

  describe("changeUserStatus Function", () => {
    it("should successfully change the user's status", async () => {
      req.params = {userId: "validUserId"};
      req.body = {status: "active"};

      const mockUser = {
        username: "user1",
        screenName: "User One",
        phone: "1234567890",
        email: "user1@example.com",
        bio: "Bio of user1",
        status: "active",
        pictureKey: "key1",
        picture: "picture1.jpg",
      };

      sandbox.stub(adminService, "restrictUser").resolves(mockUser);

      await changeUserStatus(req, res, next);

      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          status: "success",
          data: mockUser,
        })
      ).to.be.true;
    });

    it("should handle invalid status in the request body", async () => {
      req.body = {status: "invalidStatus"};
      req.params = {userId: 1234};

      await changeUserStatus(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.be.instanceOf(AppError);
      expect(error.message).to.equal(
        "Invalid status. Allowed values are 'banned', 'active', or 'inactive'"
      );
      expect(error.statusCode).to.equal(400);
    });

    it("should handle invalid userId", async () => {
      req.params = {userId: "invalidUserId"};
      req.body = {status: "active"};

      sandbox
        .stub(adminService, "restrictUser")
        .throws(new AppError("Invalid userId provided", 400));

      await changeUserStatus(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.be.instanceOf(AppError);
      expect(error.message).to.equal("Invalid userId provided");
      expect(error.statusCode).to.equal(400);
    });

    it("should handle service returning null (user not found)", async () => {
      req.params = {userId: "validUserId"};
      req.body = {status: "active"};

      sandbox.stub(adminService, "restrictUser").resolves(null);

      await changeUserStatus(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.be.instanceOf(AppError);
      expect(error.message).to.equal(
        "An error occurred while updating the user's status"
      );
      expect(error.statusCode).to.equal(500);
    });

    it("should handle unexpected errors", async () => {
      req.params = {userId: "validUserId"};
      req.body = {status: "active"};

      const unexpectedError = new Error("Unexpected error");
      sandbox.stub(adminService, "restrictUser").throws(unexpectedError);

      await changeUserStatus(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.equal(unexpectedError);
    });
  });
});
