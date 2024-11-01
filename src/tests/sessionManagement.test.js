const {expect} = require("chai");
const sinon = require("sinon");

const userService = require("../services/userService");
const sessionService = require("../services/sessionService");

const manageSessionForUser = require("../utils/sessionManagement").default;
const generateTokenModule = require("../utils/generateToken");
const addAuthCookieModule = require("../utils/addAuthCookie");

describe("manageSessionForUser Function Test Suites", () => {
  let req, res, user;

  beforeEach(() => {
    req = {
      headers: {
        "user-agent": "Mozilla/5.0/5.0",
        "x-forwarded-for": "localhost",
      },
      connection: {
        remoteAddress: "localhost",
      },
    };

    res = {
      cookie: sinon.stub(),
    };

    user = {
      _id: "userId",
      username: "testUser",
      email: "test@example.com",
      phone: "1234567890",
      loggedOutFromAllDevicesAt: null,
    };

    sinon.stub(addAuthCookieModule, "default").callsFake(() => {});
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should manage session and return updated user and access token", async () => {
    const accessToken = "fakeAccessToken";
    const refreshToken = "fakeRefreshToken";

    sinon
      .stub(generateTokenModule, "default")
      .callsFake((userTokenedData, tokenName) => {
        if (tokenName === process.env.COOKIE_ACCESS_NAME) {
          return accessToken;
        }

        if (tokenName === process.env.COOKIE_REFRESH_NAME) {
          return refreshToken;
        }
      });

    sinon.stub(sessionService, "findSessionByUserIdAndUpdate").resolves(null);
    sinon.stub(sessionService, "createSession").resolves();
    sinon.stub(userService, "findOneAndUpdate").resolves(user);

    const result = await manageSessionForUser(req, res, user);

    expect(result).to.deep.equal({
      updatedUser: user,
      accessToken,
    });

    expect(addAuthCookieModule.default.calledOnce).to.be.true;
    expect(addAuthCookieModule.default.calledWith(accessToken, res, true)).to.be
      .true;
  });

  it("should update the session if it already exists", async () => {
    const accessToken = "fakeAccessToken";
    const refreshToken = "fakeRefreshToken";

    sinon
      .stub(generateTokenModule, "default")
      .callsFake((userTokenedData, tokenName) => {
        if (tokenName === process.env.COOKIE_ACCESS_NAME) {
          return accessToken;
        }

        if (tokenName === process.env.COOKIE_REFRESH_NAME) {
          return refreshToken;
        }
      });

    const existingSession = {
      currentDeviceType: "Mozilla/5.0",
    };

    sinon
      .stub(sessionService, "findSessionByUserIdAndUpdate")
      .resolves(existingSession);
    sinon.stub(userService, "findOneAndUpdate").resolves(user);

    const result = await manageSessionForUser(req, res, user);

    expect(result).to.deep.equal({
      updatedUser: user,
      accessToken,
    });

    expect(addAuthCookieModule.default.calledOnce).to.be.true;
    expect(addAuthCookieModule.default.calledWith(accessToken, res, true)).to.be
      .true;
  });

  it("should handle errors when finding or updating user", async () => {
    const accessToken = "fakeAccessToken";
    sinon.stub(generateTokenModule, "default").returns(accessToken);

    sinon.stub(sessionService, "findSessionByUserIdAndUpdate").resolves(null);
    sinon.stub(sessionService, "createSession").resolves();

    sinon
      .stub(userService, "findOneAndUpdate")
      .rejects(new Error("User update error"));

    try {
      await manageSessionForUser(req, res, user);
    } catch (error) {
      expect(error.message).to.equal("User update error");
    }
  });
});
