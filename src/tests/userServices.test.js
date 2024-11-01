const sinon = require("sinon");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const {expect} = chai;

const User = require("../models/user");

const AppError = require("../errors/appError");

const userService = require("../services/userService");

chai.use(chaiAsPromised);

describe("User Service Test Suite", function () {
  this.timeout(5000);
  afterEach(() => {
    sinon.restore();
  });

  describe("getUserPasswordById Function Test Suite", function () {
    it("should return the user's password with a correct Id", async () => {
      const mockPassword = "Password is: 1234";
      const mockUser = {password: mockPassword};
      const findByIdStub = sinon.stub(User, "findById").returns({
        select: sinon.stub().resolves(mockUser),
      });

      const result = await userService.getUserPasswordById(1);

      expect(result).to.equal(mockPassword);
      sinon.assert.calledOnce(findByIdStub);
      sinon.assert.calledWith(findByIdStub, 1);
    });

    it("shouldn't return the user's password with a non-existed Id", async () => {
      const findByIdStub = sinon.stub(User, "findById").returns({
        select: sinon.stub().resolves(null),
      });

      const result = await userService.getUserPasswordById(1);

      expect(result).to.equal(null);
      sinon.assert.calledOnce(findByIdStub);
      sinon.assert.calledWith(findByIdStub, 1);
    });

    const testInvalidId = async (id) => {
      const findByIdStub = sinon.stub(User, "findById").returns({
        select: sinon.stub().resolves(null),
      });

      await expect(userService.getUserPasswordById(id)).to.be.rejectedWith(
        AppError,
        "User Id is required"
      );

      sinon.assert.notCalled(findByIdStub);
    };

    it("should throw an error if user ID is null", async () => {
      await testInvalidId(null);
    });

    it("should throw an error if user ID is undefined", async () => {
      await testInvalidId(undefined);
    });
  });

  describe("getUserId Function Test Suite", function () {
    it("should return the user's Id with a correct Id", async () => {
      const mockId = "Id is: 1234";
      const mockUser = {id: mockId};

      const findUserIdStub = sinon.stub(User, "findOne").returns({
        select: sinon.stub().resolves(mockUser),
      });

      const result = await userService.getUserId("test@example.com");

      expect(result).to.equal(mockId);
      sinon.assert.calledOnce(findUserIdStub);
      sinon.assert.calledWith(findUserIdStub, {
        $or: [
          {email: "test@example.com"},
          {username: "test@example.com"},
          {phone: "test@example.com"},
        ],
      });
    });

    it("shouldn't return the user's Id with a non-existed Id", async () => {
      const findUserIdStub = sinon.stub(User, "findOne").returns({
        select: sinon.stub().resolves(null),
      });

      const result = await userService.getUserId("test@example.com");

      expect(result).to.equal(null);
      sinon.assert.calledOnce(findUserIdStub);
      sinon.assert.calledWith(findUserIdStub, {
        $or: [
          {email: "test@example.com"},
          {username: "test@example.com"},
          {phone: "test@example.com"},
        ],
      });
    });

    const testInvalidId = async (id) => {
      const findUserIdStub = sinon
        .stub(userService, "getUserByUUID")
        .returns(Promise.resolve(null));

      await expect(userService.getUserId(id)).to.be.rejectedWith(
        AppError,
        "A UUID is required"
      );

      sinon.assert.notCalled(findUserIdStub);
    };

    it("should throw an error if user Id is null", async () => {
      await testInvalidId(null);
    });

    it("should throw an error if user Id is undefined", async () => {
      await testInvalidId(undefined);
    });
  });

  describe("getUserByEmail", function () {
    it("should return the user's information with a correct email", async () => {
      const mockUserData = {
        id: 1,
        email: "test@example.com",
        phone: "01004033477",
      };
      const mockUser = {...mockUserData};

      const findUserStub = sinon.stub(User, "findOne").resolves(mockUser);

      const result = await userService.getUserByEmail("test@example.com");

      expect(result).to.equal(mockUser);
      sinon.assert.calledOnce(findUserStub);
      sinon.assert.calledWith(findUserStub, {email: "test@example.com"});
    });

    it("shouldn't return the user's information with a non-existed email", async () => {
      const findUserStub = sinon.stub(User, "findOne").resolves(null);

      const result = await userService.getUserByEmail("test@example.com");

      expect(result).to.equal(null);
      sinon.assert.calledOnce(findUserStub);
      sinon.assert.calledWith(findUserStub, {email: "test@example.com"});
    });

    const testInvalidEmail = async (email) => {
      const findUserStub = sinon.stub(User, "findOne").resolves(null);

      await expect(userService.getUserByEmail(email)).to.be.rejectedWith(
        AppError,
        "An email is required"
      );

      sinon.assert.notCalled(findUserStub);
    };

    it("should throw an error if user email is null", async () => {
      await testInvalidEmail(null);
    });

    it("should throw an error if user email is undefined", async () => {
      await testInvalidEmail(undefined);
    });
  });

  describe("getUserBasicInfoByUUID Function Test Suite", function () {
    it("should return the user's basic information with a correct UUID", async () => {
      const mockUserData = {
        _id: 1,
        username: "test",
        email: "test@example.com",
        phone: "01004033477",
        status: "active",
        password: "12345",
        registrationDate: Date.now(),
        loggedOutFromAllDevicesAt: new Date(
          new Date().getTime() - 24 * 60 * 60 * 1000
        ),
      };
      const mockUser = {...mockUserData};

      const findUserStub = sinon
        .stub(User, "findOne")
        .returns({select: sinon.stub().resolves(mockUser)});

      const result =
        await userService.getUserBasicInfoByUUID("test@example.com");

      expect(result).to.equal(mockUser);
      sinon.assert.calledOnce(findUserStub);
      sinon.assert.calledWith(findUserStub, {
        $or: [
          {email: "test@example.com"},
          {username: "test@example.com"},
          {phone: "test@example.com"},
        ],
      });
    });

    it("shouldn't return the user's information with a non-existed UUID", async () => {
      const findUserStub = sinon
        .stub(User, "findOne")
        .returns({select: sinon.stub().resolves(null)});

      const result =
        await userService.getUserBasicInfoByUUID("test@example.com");

      expect(result).to.equal(null);
      sinon.assert.calledOnce(findUserStub);
      sinon.assert.calledWith(findUserStub, {
        $or: [
          {email: "test@example.com"},
          {username: "test@example.com"},
          {phone: "test@example.com"},
        ],
      });
    });

    const testInvalidUUID = async (email) => {
      const findUserStub = sinon.stub(User, "findOne").resolves(null);

      await expect(
        userService.getUserBasicInfoByUUID(email)
      ).to.be.rejectedWith(AppError, "An UUID is required");

      sinon.assert.notCalled(findUserStub);
    };

    it("should throw an error if user UUID is null", async () => {
      await testInvalidUUID(null);
    });

    it("should throw an error if user UUID is undefined", async () => {
      await testInvalidUUID(undefined);
    });
  });

  describe("createUser Function Test Suite", function () {
    it("should create a user with basic fields", async function () {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        phone: "1234567890",
        password: "password123",
        passwordConfirm: "password123",
        picture: "profile.jpg",
        accessToken: "accessToken12345@",
        refreshToken: "refreshToken12345@",
      };

      const createStub = sinon.stub(User, "create").resolves(userData);

      const result = await userService.createUser(userData);

      expect(result).to.equal(userData);
      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, userData);
    });

    it("should create a user with Google ID if isGoogleUser is true", async function () {
      const userData = {
        username: "googleuser",
        email: "googleuser@example.com",
        phone: "0987654321",
        password: "password123",
        passwordConfirm: "password123",
        picture: "googleprofile.jpg",
        accessToken: "accessToken12345@",
        refreshToken: "refreshToken12345@",
        id: "google123",
        isGoogleUser: true,
      };

      const expectedData = {...userData, googleId: "google123"};
      const createStub = sinon.stub(User, "create").resolves(expectedData);

      const result = await userService.createUser(userData);

      expect(createStub.calledOnce).to.be.true;
      expect(createStub.calledWith(sinon.match.has("googleId", "google123"))).to
        .be.true;
      expect(result).to.equal(expectedData);
    });

    it("should create a user with GitHub ID if isGitHubUser is true", async function () {
      const userData = {
        username: "githubuser",
        email: "githubuser@example.com",
        phone: "0123456789",
        password: "password123",
        passwordConfirm: "password123",
        picture: "githubprofile.jpg",
        accessToken: "accessToken12345@",
        refreshToken: "refreshToken12345@",
        id: "github123",
        isGitHubUser: true,
      };

      const expectedData = {...userData, gitHubId: "github123"};
      const createStub = sinon.stub(User, "create").resolves(expectedData);

      const result = await userService.createUser(userData);

      expect(createStub.calledOnce).to.be.true;
      expect(createStub.calledWith(sinon.match.has("gitHubId", "github123"))).to
        .be.true;
      expect(result).to.equal(expectedData);
    });
  });
});
