const {expect} = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

const AppError = require("../errors/appError");

const userService = require("../services/userService");
const sessionService = require("../services/sessionService");

const logout = require("../controllers/auth/logout");

describe("Logout Function Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        "user-agent": "Mozilla/5.0",
      },
      user: {
        email: "test@example.com",
        currentSession: {
          _id: new mongoose.Types.ObjectId(),
        },
      },
    };

    res = {
      clearCookie: sinon.stub(),
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should log out the user successfully", async () => {
    const deleteSessionStub = sinon
      .stub(sessionService, "deleteSession")
      .resolves();
    const findOneAndUpdateStub = sinon
      .stub(userService, "findOneAndUpdate")
      .resolves();

    await logout(req, res, next);

    expect(deleteSessionStub.calledOnce).to.be.true;
    expect(findOneAndUpdateStub.calledOnce).to.be.true;
    expect(res.clearCookie.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(
      res.json.calledWith({
        status: "success",
        message: "Successfully logged out",
      })
    ).to.be.true;
    expect(next.called).to.be.false;
  });

  it("should handle errors during logout process", async () => {
    const error = new Error("Some error");
    sinon.stub(sessionService, "deleteSession").rejects(error);

    await logout(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.be.instanceOf(AppError);
    expect(next.firstCall.args[0].message).to.equal(
      "Logout failed, please try again later"
    );
    expect(res.status.called).to.be.false;
    expect(res.json.called).to.be.false;
    expect(res.clearCookie.called).to.be.false;
  });
});
