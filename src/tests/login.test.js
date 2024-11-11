const {expect} = require("chai");
const sinon = require("sinon");

const bcrypt = require("bcryptjs");

const AppError = require("../errors/appError");

const userService = require("../services/userService");

const sessionManagementModule = require("../utils/sessionManagement");

const login = require("../controllers/auth/login");

describe("Login Function", () => {
  let req, res, next;
  let user;

  beforeEach(() => {
    req = {
      body: {
        UUID: "user-uuid",
        password: "password123",
      },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
    user = {
      UUID: "user-uuid",
      password: "$2a$10$Q6uNfG7XK9d5pVR6V0y8bO3ycOPqlGE2TNT7fAcGgQ.BHAmN8E1Ca", // Example hashed password
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return an error if user is not found", async () => {
    sinon.stub(userService, "getUserBasicInfoByUUID").resolves(null);

    await login(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.args[0][0]).to.be.instanceOf(AppError);
    expect(next.args[0][0].message).to.equal(
      "No user has been found with that UUID"
    );
    expect(next.args[0][0].statusCode).to.equal(404);
  });

  it("should return an error if password is incorrect", async () => {
    sinon.stub(userService, "getUserBasicInfoByUUID").resolves(user);
    sinon.stub(bcrypt, "compare").resolves(false);

    await await login(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.args[0][0]).to.be.instanceOf(AppError);
    expect(next.args[0][0].message).to.equal("Wrong password entered");
    expect(next.args[0][0].statusCode).to.equal(401);
  });

  it("should log in the user successfully", async () => {
    sinon.stub(userService, "getUserBasicInfoByUUID").resolves(user);
    sinon.stub(bcrypt, "compare").resolves(true);
    sinon.stub(sessionManagementModule, "default").resolves({
      updatedUser: user,
      accessToken: "fakeAccessToken",
    });

    await await await login(req, res, next);

    expect(res.status.calledOnce).to.be.true;
    expect(res.status.args[0][0]).to.equal(200);
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.args[0][0]).to.deep.equal({
      data: {
        updatedUser: user,
        accessToken: "fakeAccessToken",
      },
      status: "Logged in successfully",
    });
  });
});
