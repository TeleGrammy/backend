/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const {expect} = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");

const AppError = require("../errors/appError");

const authMiddleware = require("../middlewares/isAuthenticated");

const userService = require("../services/userService");
const sessionService = require("../services/sessionService");

const isLoggedOutModule = require("../utils/isLoggedOut");

describe("Auth Middleware Tests", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {
        "user-agent": "Mozilla/5.0",
        "x-forwarded-for": "123.123.123.123",
      },
      cookies: {},
    };

    res = {
      clearCookie: sinon.stub(),
      cookie: sinon.stub(),
    };

    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should allow access with valid access token", async () => {
    const userId = "123456";
    const accessToken = jwt.sign(
      {name: "user", id: userId},
      process.env.JWT_SECRET
    );
    req.cookies[process.env.COOKIE_ACCESS_NAME] = accessToken;

    const user = {id: userId, name: "Test User"};
    sinon.stub(userService, "getUserBasicInfoByUUID").resolves(user);
    sinon.stub(sessionService, "findSessionByUserIdAndDevice").resolves({});
    sinon.stub(isLoggedOutModule, "default").resolves(false);

    await await await authMiddleware(req, res, next);

    expect(req.user).to.have.property("name", "user");
    expect(req.user).to.have.property("id", userId);
    expect(next.calledOnce).to.be.true;
  });

  it("should handle expired access token and refresh token correctly", async () => {
    const accessToken = jwt.sign(
      {name: "user", id: "123456"},
      process.env.JWT_SECRET,
      {expiresIn: -1}
    );
    const refreshToken = jwt.sign({name: "user"}, process.env.JWT_SECRET);
    req.cookies[process.env.COOKIE_ACCESS_NAME] = accessToken;

    const jwtVerifyStub = sinon.stub(jwt, "verify");
    jwtVerifyStub
      .withArgs(accessToken, process.env.JWT_SECRET)
      .throws({name: "TokenExpiredError"});

    jwtVerifyStub
      .withArgs(refreshToken, process.env.JWT_SECRET)
      .returns({name: "user"});

    sinon
      .stub(sessionService, "findSessionByUserIdAndDevice")
      .resolves({refreshToken});
    sinon
      .stub(userService, "getUserBasicInfoByUUID")
      .resolves({id: "123456", name: "Test User"});
    sinon.stub(sessionService, "createSession").resolves();
    sinon.stub(sessionService, "findSessionByUserIdAndUpdate").resolves();

    await await await authMiddleware(req, res, next);

    expect(next.calledOnce).to.be.true;

    jwtVerifyStub.restore();
    sinon.restore();
  });

  it("should return error if access token is invalid", async () => {
    req.cookies[process.env.COOKIE_ACCESS_NAME] = "invalid-token";

    await await authMiddleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
    expect(next.firstCall.args[0].message).to.equal("Invalid access token");
  });

  it("should handle user not found after token verification", async () => {
    const accessToken = jwt.sign(
      {name: "user", id: "123456"},
      process.env.JWT_SECRET
    );
    req.cookies[process.env.COOKIE_ACCESS_NAME] = accessToken;

    sinon.stub(userService, "getUserBasicInfoByUUID").resolves(null);

    await authMiddleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
    expect(next.firstCall.args[0].message).to.equal("Unauthorized access");
  });

  it("should clear cookie and return error if user is logged out from all devices", async () => {
    const accessToken = jwt.sign(
      {name: "user", id: "123456"},
      process.env.JWT_SECRET
    );
    req.cookies[process.env.COOKIE_ACCESS_NAME] = accessToken;

    const user = {id: "123456", name: "Test User"};
    sinon.stub(userService, "getUserBasicInfoByUUID").resolves(user);
    sinon
      .stub(sessionService, "findSessionByUserIdAndDevice")
      .resolves({_id: "session-id"});
    sinon.stub(sessionService, "deleteSession").resolves();
    sinon.stub(isLoggedOutModule, "default").resolves(true);

    await await await await authMiddleware(req, res, next);

    expect(res.clearCookie.calledOnce).to.be.true;
    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
    expect(next.firstCall.args[0].message).to.equal(
      "Unauthorized access, all devices are logged out"
    );
  });

  it("should return error if user is not found", async () => {
    const accessToken = jwt.sign(
      {name: "user", id: "123456"},
      process.env.JWT_SECRET,
      {expiresIn: -1}
    );

    const refreshToken = jwt.sign(
      {name: "user", id: "123456"},
      process.env.JWT_SECRET
    );

    req.cookies[process.env.COOKIE_ACCESS_NAME] = accessToken;

    sinon.stub(sessionService, "findSessionByUserIdAndDevice").resolves({
      refreshToken,
    });
    sinon.stub(userService, "getUserBasicInfoByUUID").resolves(null);

    await await await authMiddleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
    expect(next.firstCall.args[0].message).to.equal(
      "User not found, please login again"
    );
  });

  it("should return error if refresh token is expired", async () => {
    const accessToken = jwt.sign(
      {name: "user", id: "123456"},
      process.env.JWT_SECRET,
      {expiresIn: -1}
    );

    const refreshToken = jwt.sign(
      {name: "user", id: "123456"},
      process.env.JWT_SECRET,
      {expiresIn: -1}
    );

    req.cookies[process.env.COOKIE_ACCESS_NAME] = accessToken;

    sinon.stub(sessionService, "findSessionByUserIdAndDevice").resolves({
      refreshToken,
    });
    sinon.stub(userService, "getUserBasicInfoByUUID").resolves(null);

    await await await authMiddleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
    expect(next.firstCall.args[0].message).to.equal(
      "Invalid refresh token, please log in again"
    );
  });

  it("should return an error if the access token passed is null", async () => {
    req.header = sinon.stub().withArgs("Authorization").returns(null);
    req.cookies[process.env.COOKIE_ACCESS_NAME] = null;

    await authMiddleware(req, res, next);
    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
    expect(next.firstCall.args[0].message).to.equal(
      "Not authorized access, Please login!"
    );
  });
});
