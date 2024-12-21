/* eslint-disable */

const {expect} = require("chai");
const sinon = require("sinon");
const passport = require("passport");

const AppError = require("../errors/appError");

const userService = require("../services/userService");

const manageSessionForUserModule = require("../utils/sessionManagement");

const {
  signInWithGoogle,
  googleCallBack,
} = require("../controllers/auth/googleAuthController");

describe("Auth Controller - Google Authentication", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {body: {}, query: {}, cookies: {}, user: {}};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("signInWithGoogle Function Test Suites", () => {
    it("should call passport.authenticate with correct parameters", () => {
      const authenticateSpy = sinon.spy(passport, "authenticate");

      signInWithGoogle(req, res, next);

      expect(authenticateSpy.calledOnce).to.be.true;
      expect(authenticateSpy.firstCall.args[0]).to.equal("google");
      expect(authenticateSpy.firstCall.args[1]).to.deep.include({
        scope: ["email", "profile"],
        accessType: "offline",
      });
    });
  });

  describe("googleCallBack", () => {
    let authenticateStub;

    beforeEach(() => {
      authenticateStub = sinon.stub(passport, "authenticate");
      req = {};
      res = {
        status: sinon.stub().returnsThis(),
        redirect: sinon.stub(),
      };
      next = sinon.stub(); // Changed to stub for consistency
    });

    it("should return an error if authentication fails", async () => {
      authenticateStub.callsFake((strategy, options, callback) => {
        return (_req, _res, _next) => {
          callback(new AppError("Authentication failed", 401), null);
        };
      });

      await googleCallBack(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
      expect(next.firstCall.args[0].message).to.equal("Authentication failed");
      expect(next.firstCall.args[0].statusCode).to.equal(401);
    });

    it("should create a new user if not found and return user info", async () => {
      const user = {
        name: "Google User",
        email: "googleuser@example.com",
        id: "google-id",
        accessToken: "access-token",
        refreshToken: "refresh-token",
        profilePicture: "profile-pic-url",
      };

      authenticateStub.callsFake((strategy, options, callback) => {
        return (_req, _res, _next) => {
          callback(null, user);
        };
      });

      sinon.stub(userService, "getUserByEmail").resolves(null);
      sinon.stub(userService, "createUser").resolves(user);
      sinon.stub(manageSessionForUserModule, "default").resolves({
        updatedUser: user,
        accessToken: "new-access-token",
      });

      await await await googleCallBack(req, res, next);

      expect(res.status.calledWith(300)).to.be.true;
      expect(res.redirect.calledOnce).to.be.true;
      expect(res.redirect.firstCall.args[0]).to.deep.equal(
        `${process.env.FRONTEND_LOGIN_CALLBACK}?accessToken=new-access-token`
      );
    });

    it("should update existing user tokens and return user info", async () => {
      const user = {
        name: "Google User",
        email: "googleuser@example.com",
        id: "google-id",
        accessToken: "access-token",
        refreshToken: "refresh-token",
        profilePicture: "profile-pic-url",
        save: sinon.stub().resolves(),
      };

      authenticateStub.callsFake((strategy, options, callback) => {
        return (_req, _res, _next) => {
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

      await await await googleCallBack(req, res, next);

      expect(user.save.calledOnce).to.be.true;
      expect(manageSessionStub.calledOnce).to.be.true;
      expect(res.status.calledWith(300)).to.be.true;
      expect(res.redirect.calledOnce).to.be.true;
      expect(res.redirect.firstCall.args[0]).to.deep.equal(
        `${process.env.FRONTEND_LOGIN_CALLBACK}?accessToken=new-access-token`
      );
    });
  });
});
