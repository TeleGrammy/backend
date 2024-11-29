/* eslint-disable node/no-unpublished-require */
/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
const {expect} = require("chai");
const sinon = require("sinon");
const passport = require("passport");

const AppError = require("../errors/appError");

const userService = require("../services/userService");

const manageSessionForUserModule = require("../utils/sessionManagement");

const {
  signInWithGitHub,
  gitHubCallBack,
} = require("../controllers/auth/githubAuthController");

describe("Auth Controller - GitHub Authentication", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {body: {}, query: {}, cookies: {}, user: {}};
    res = {
      status: sinon.stub().returnsThis(),
      redirect: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("signInWithGitHub Function Test Suites", () => {
    it("should call passport-authenticate with correct parameters", () => {
      const authenticateSpy = sinon.spy(passport, "authenticate");

      signInWithGitHub(req, res, next);

      expect(authenticateSpy.calledOnce).to.be.true;
      expect(authenticateSpy.firstCall.args[0]).to.equal("github");
      expect(authenticateSpy.firstCall.args[1]).to.deep.include({
        scope: ["user:email", "user"],
        accessType: "offline",
      });
    });
  });

  describe("gitHubCallBack", () => {
    let authenticateStub;

    beforeEach(() => {
      authenticateStub = sinon.stub(passport, "authenticate");
    });

    it("should return an error if authentication fails", async () => {
      authenticateStub.callsFake((strategy, options, callback) => {
        return (req, res, next) => {
          callback(new AppError("Authentication failed", 401), null);
        };
      });

      await await await gitHubCallBack(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal("Authentication failed");
      expect(next.firstCall.args[0].statusCode).to.equal(401);
    });

    it("should create a new user if not found and return user info", async () => {
      const user = {
        name: "GitHub User",
        email: "githubuser@example.com",
        id: "github-id",
        accessToken: "access-token",
        refreshToken: "refresh-token",
        profilePicture: "profile-pic-url",
      };

      authenticateStub.callsFake((strategy, options, callback) => {
        return (req, res, next) => {
          req.user = user;
          callback(null, user);
        };
      });

      sinon.stub(userService, "getUserByEmail").resolves(null);
      sinon.stub(userService, "createUser").resolves(user);
      sinon.stub(manageSessionForUserModule, "default").resolves({
        updatedUser: user,
        accessToken: "new-access-token",
      });

      await await await gitHubCallBack(req, res, next);

      expect(res.status.calledWith(300)).to.be.true;
      expect(res.redirect.calledOnce).to.be.true;
      expect(res.redirect.firstCall.args[0]).to.deep.equal(
        process.env.FRONTEND_LOGIN_CALLBACK
      );
    });

    it("should update existing user tokens and return user info", async () => {
      const user = {
        name: "GitHub User",
        email: "githubuser@example.com",
        id: "github-id",
        accessToken: "access-token",
        refreshToken: "refresh-token",
        profilePicture: "profile-pic-url",
        save: sinon.stub().resolves(),
      };

      authenticateStub.callsFake((strategy, options, callback) => {
        return (req, res, next) => {
          req.user = user;
          callback(null, user);
        };
      });

      sinon.stub(userService, "getUserByEmail").resolves(user);
      const manageSessionStub = sinon
        .stub(manageSessionForUserModule, "default")
        .resolves({
          updatedUser: user,
          accessToken: "new-access-token",
        });

      await await await gitHubCallBack(req, res, next);

      expect(user.save.calledOnce).to.be.true;
      expect(manageSessionStub.calledOnce).to.be.true;
      expect(res.status.calledWith(300)).to.be.true;
      expect(res.redirect.calledOnce).to.be.true;
      expect(res.redirect.firstCall.args[0]).to.deep.equal(
        process.env.FRONTEND_LOGIN_CALLBACK
      );
    });
  });
});
