const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const {expect} = chai;

const AppError = require("../../errors/appError");

const User = require("../../models/user");
const Group = require("../../models/groupModel");

const {
  getUsers,
  getGroups,
  restrictUser,
} = require("../../services/adminService");

describe("Admin Service Test Suites", () => {
  let findStub, findByIdAndUpdateStub, groupFindStub;

  beforeEach(() => {
    findStub = sinon.stub(User, "find");
    findByIdAndUpdateStub = sinon.stub(User, "findByIdAndUpdate");
    groupFindStub = sinon.stub(Group, "find");
  });

  afterEach(() => {
    findStub.restore();
    findByIdAndUpdateStub.restore();
    groupFindStub.restore();
  });

  describe("getUsers Function", () => {
    // it("should throw an error if adminId is not a valid ObjectId", async () => {
    //   const invalidAdminId = "invalidId";
    //   try {
    //     await getUsers(invalidAdminId);
    //     expect.fail("Expected error was not thrown");
    //   } catch (err) {
    //     expect(err).to.be.an.instanceOf(AppError);
    //     expect(err.statusCode).to.equal(400);
    //     expect(err.message).to.equal("Invalid adminId provided");
    //   }
    // });

    it("should return users excluding the adminId and banned users", async () => {
      const validAdminId = new mongoose.Types.ObjectId();
      const mockUsers = [
        {
          username: "user1",
          screenName: "User One",
          phone: "12345",
          email: "user1@example.com",
          bio: "Bio 1",
          status: "active",
          pictureKey: "pic1",
          picture: "pic1.jpg",
        },
        {
          username: "user2",
          screenName: "User Two",
          phone: "67890",
          email: "user2@example.com",
          bio: "Bio 2",
          status: "active",
          pictureKey: "pic2",
          picture: "pic2.jpg",
        },
      ];

      // Create a mock for the select method that resolves to mockUsers
      const selectStub = sinon.stub().resolves(mockUsers);

      // Mock the find method to return an object that supports chaining (i.e., `select`)
      findStub.returns({
        select: selectStub, // Ensure that select is directly available on the result of `find`
      });

      // Call the getUsers function
      const result = await getUsers(validAdminId);

      // Verify that the find method was called with the correct query
      expect(findStub.args[0][0]).to.deep.equal(""
        _id: {$ne: validAdminId},
        status: {$ne: "banned"},
      });

      // Verify that select was called with the correct fields
      expect(
        selectStub.calledOnceWithExactly(
          "username screenName phone email bio status pictureKey picture"
        )
      ).to.be.true;

      // Verify the result
      expect(result).to.deep.equal(mockUsers);
    });

    // it("should throw an error if the database query fails", async () => {
    //   const validAdminId = new mongoose.Types.ObjectId();
    //   const errorMessage = "Database error";

    //   findStub.rejects(new Error(errorMessage));

    //   try {
    //     await getUsers(validAdminId);
    //     expect.fail("Expected error was not thrown");
    //   } catch (err) {
    //     expect(err).to.be.an.instanceOf(Error);
    //     expect(err.message).to.equal(errorMessage);
    //   }
    // });
  });

  // describe("getGroups", () => {
  //   it("should return groups with populated owner information", async () => {
  //     const mockGroups = [
  //       {
  //         name: "Group 1",
  //         description: "Description 1",
  //         ownerId: new mongoose.Types.ObjectId(),
  //       },
  //       {
  //         name: "Group 2",
  //         description: "Description 2",
  //         ownerId: new mongoose.Types.ObjectId(),
  //       },
  //     ];

  //     const mockOwner = {
  //       username: "owner",
  //       screenName: "Owner",
  //       phone: "12345",
  //       email: "owner@example.com",
  //       _id: "ownerId",
  //     };

  //     groupFindStub.resolves(mockGroups);
  //     sinon.stub(User, "findById").resolves(mockOwner);

  //     const result = await getGroups();

  //     expect(groupFindStub.calledOnce).to.be.true;
  //     expect(result[0].owner).to.deep.equal(mockOwner);
  //     expect(result[0]).to.not.have.property("ownerId");
  //   });

  //   it("should throw an error if the database query fails", async () => {
  //     const errorMessage = "Database error";

  //     groupFindStub.rejects(new Error(errorMessage));

  //     try {
  //       await getGroups();
  //       expect.fail("Expected error was not thrown");
  //     } catch (err) {
  //       expect(err).to.be.an.instanceOf(Error);
  //       expect(err.message).to.equal(errorMessage);
  //     }
  //   });
  // });

  // describe("restrictUser", () => {
  //   it("should throw an error if userId is not a valid ObjectId", async () => {
  //     const invalidUserId = "invalidId";
  //     const newData = {status: "restricted"};
  //     try {
  //       await restrictUser(invalidUserId, newData);
  //       expect.fail("Expected error was not thrown");
  //     } catch (err) {
  //       expect(err).to.be.an.instanceOf(AppError);
  //       expect(err.statusCode).to.equal(400);
  //       expect(err.message).to.equal("Invalid userId provided");
  //     }
  //   });

  //   it("should update user data successfully", async () => {
  //     const validUserId = new mongoose.Types.ObjectId();
  //     const newData = {status: "restricted"};

  //     const mockUser = {
  //       username: "user1",
  //       screenName: "User One",
  //       phone: "12345",
  //       email: "user1@example.com",
  //       bio: "Bio 1",
  //       status: "active",
  //       pictureKey: "pic1",
  //       picture: "pic1.jpg",
  //     };

  //     findByIdAndUpdateStub.resolves(mockUser);

  //     const result = await restrictUser(validUserId, newData);

  //     expect(
  //       findByIdAndUpdateStub.calledOnceWithExactly(validUserId, newData, {
  //         new: true,
  //       })
  //     ).to.be.true;

  //     expect(result).to.deep.equal(mockUser);
  //   });

  //   it("should throw an error if the database query fails", async () => {
  //     const validUserId = new mongoose.Types.ObjectId();
  //     const newData = {status: "restricted"};
  //     const errorMessage = "Database error";

  //     findByIdAndUpdateStub.rejects(new Error(errorMessage));

  //     try {
  //       await restrictUser(validUserId, newData);
  //       expect.fail("Expected error was not thrown");
  //     } catch (err) {
  //       expect(err).to.be.an.instanceOf(Error);
  //       expect(err.message).to.equal(errorMessage);
  //     }
  //   });
  // });
});
