const sinon = require("sinon");
const {expect} = require("chai");

const jwt = require("jsonwebtoken");

const AppError = require("../errors/appError");

const generateToken = require("../utils/generateToken");

describe("generateToken Function Test Suite", function () {
  const userTokenedData = {id: 1, username: "testUser"};

  afterEach(() => {
    sinon.restore();
  });

  it("should throw an error if JWT_SECRET is not defined", () => {
    delete process.env.JWT_SECRET;

    expect(() => generateToken(userTokenedData, "access")).to.throw(
      AppError,
      "JWT secret is not defined in environment variables."
    );
  });

  it("should generate an access token with correct options", () => {
    process.env.JWT_SECRET = "testSecret";
    process.env.COOKIE_ACCESS_NAME = "access";
    process.env.JWT_ACCESS_EXPIRES_IN_HOURS = "1h";

    const signStub = sinon.stub(jwt, "sign").returns("mockedAccessToken");

    const token = generateToken(
      userTokenedData,
      process.env.COOKIE_ACCESS_NAME
    );

    expect(token).to.equal("mockedAccessToken");
    expect(signStub.calledOnce).to.be.true;
    expect(
      signStub.calledWith(userTokenedData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN_HOURS,
        issuer: "myapp",
        audience: "myapp-users",
      })
    ).to.be.true;
  });

  it("should generate a refresh token with correct options", () => {
    process.env.JWT_SECRET = "testSecret";
    process.env.COOKIE_REFRESH_NAME = "refresh";
    process.env.JWT_REFRESH_EXPIRES_IN_DAYS = "30d";

    const signStub = sinon.stub(jwt, "sign").returns("mockedRefreshToken");

    const token = generateToken(
      userTokenedData,
      process.env.COOKIE_REFRESH_NAME
    );

    expect(token).to.equal("mockedRefreshToken");
    expect(signStub.calledOnce).to.be.true;
    expect(
      signStub.calledWith(userTokenedData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN_DAYS,
        issuer: "myapp",
        audience: "myapp-users",
      })
    ).to.be.true;
  });

  it("should throw an error if an unknown token name is passed", () => {
    process.env.JWT_SECRET = "testSecret";

    expect(() => generateToken(userTokenedData, "unknownToken")).to.throw(
      AppError,
      "Unknown token name is passed"
    );
  });
});
