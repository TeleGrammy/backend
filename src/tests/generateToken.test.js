const sinon = require("sinon");
const {expect} = require("chai");

const jwt = require("jsonwebtoken");

const AppError = require("../errors/appError");

const generateToken = require("../utils/generateToken");

describe("generateToken Function", () => {
  let userTokenedData;
  let tokenName;

  beforeEach(() => {
    userTokenedData = {id: "12345", name: "testUser"};
    tokenName = "accessToken";
    sinon.stub(jwt, "sign");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should generate a token for access", () => {
    process.env.JWT_SECRET = "secret";
    process.env.JWT_ACCESS_EXPIRES_IN_HOURS = "1h";
    process.env.COOKIE_ACCESS_NAME = "accessToken";

    jwt.sign.returns("mockAccessToken");

    const token = generateToken(userTokenedData, tokenName);

    expect(token).to.equal("mockAccessToken");
    expect(jwt.sign.calledOnce).to.be.true;
    expect(jwt.sign.firstCall.args[0]).to.deep.equal(userTokenedData); // Check user data
    expect(jwt.sign.firstCall.args[1]).to.equal(process.env.JWT_SECRET); // Check secret
    expect(jwt.sign.firstCall.args[2]).to.deep.equal({
      expiresIn: "1h",
      issuer: "myapp",
      audience: "myapp-users",
    });
  });

  it("should generate a token for refresh", () => {
    process.env.JWT_SECRET = "secret";
    process.env.JWT_REFRESH_EXPIRES_IN_DAYS = "7d";
    process.env.COOKIE_REFRESH_NAME = "refresh_token";

    tokenName = process.env.COOKIE_REFRESH_NAME;

    jwt.sign.returns("mockRefreshToken");
    const token = generateToken(userTokenedData, tokenName);

    expect(token).to.equal("mockRefreshToken");
    expect(jwt.sign.calledOnce).to.be.true;
    expect(jwt.sign.firstCall.args[0]).to.deep.equal(userTokenedData); // Check user data
    expect(jwt.sign.firstCall.args[1]).to.equal(process.env.JWT_SECRET); // Check secret
    expect(jwt.sign.firstCall.args[2]).to.deep.equal({
      expiresIn: "7d",
      issuer: "myapp",
      audience: "myapp-users",
    });
  });

  it("should throw an error if JWT_SECRET is not defined", () => {
    delete process.env.JWT_SECRET;

    expect(() => generateToken(userTokenedData, tokenName)).to.throw(
      AppError,
      "JWT secret is not defined in environment variables."
    );
  });

  it("should throw an error for unknown token name", () => {
    process.env.JWT_SECRET = "secret";
    tokenName = "unknown_token";

    expect(() => generateToken(userTokenedData, tokenName)).to.throw(
      AppError,
      "Unknown token name is passed"
    );
  });
});
