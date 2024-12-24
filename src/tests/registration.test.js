/* eslint-disable no-undef */
// eslint-disable-next-line node/no-unpublished-require
const request = require("supertest");
const app = require("../expressApp"); // Ensure this points to your Express app
const PendingUser = require("../models/pending-user");
const userService = require("../services/userService");
const {generateConfirmationCode} = require("../utils/codeGenerator");
const {sendConfirmationEmail} = require("../utils/mailingServcies");
const {disconnectPublsierAndSubscriber} = require("../ioApp"); // Adjust path as needed

// Mock dependencies
jest.mock("../models/pending-user");
jest.mock("../services/userService");
jest.mock("../utils/codeGenerator");
jest.mock("../utils/mailingServcies");
jest.mock("../utils/sessionManagement", () => jest.fn());

describe("User Registration and Verification Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user and send a verification email", async () => {
      const mockUser = {
        username: "testinguser",
        email: "testinguser@example.com",
        password: "password123",
        passwordConfirm: "password123",
        phone: "+201004321321",
      };

      generateConfirmationCode.mockReturnValue("123456");
      sendConfirmationEmail.mockResolvedValue();

      PendingUser.prototype.save = jest.fn().mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(mockUser);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe(
        "Registration successful. Please check your email for the verification code."
      );
      expect(PendingUser.prototype.save).toHaveBeenCalled();
      expect(sendConfirmationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.username,
        "123456",
        process.env.SNDGRID_TEMPLATEID_REGESTRATION_EMAIL
      );
    });
  });

  describe("POST /api/v1/auth/verify", () => {
    it("should verify a user with correct code", async () => {
      const mockUser = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "password123",
        phone: "1234567890",
        verificationCode: "123456",
        codeExpiresAt: new Date(Date.now() + 10000),
      };

      PendingUser.findOne = jest.fn().mockResolvedValue(mockUser);
      userService.createUser.mockResolvedValue(mockUser);

      const res = await request(app).post("/api/v1/auth/verify").send({
        email: mockUser.email,
        verificationCode: "123456",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Account verified successfully");
      expect(userService.createUser).toHaveBeenCalledWith({
        username: mockUser.username,
        email: mockUser.email,
        password: mockUser.password,
        passwordConfirm: mockUser.passwordConfirm,
        phone: mockUser.phone,
      });
      expect(PendingUser.deleteOne).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });

    it("should return 400 if verification code is incorrect", async () => {
      PendingUser.findOne = jest.fn().mockResolvedValue({
        verificationCode: "wrongcode",
        codeExpiresAt: new Date(Date.now() + 10000),
      });

      const res = await request(app).post("/api/v1/auth/verify").send({
        email: "test@example.com",
        verificationCode: "123456",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid verification code");
    });

    it("should return 404 if user not found", async () => {
      PendingUser.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app).post("/api/v1/auth/verify").send({
        email: "nonexistent@example.com",
        verificationCode: "123456",
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(
        "User not found or it might be verified already"
      );
    });
  });

  describe("POST /api/v1/auth/resend-verification", () => {
    it("should resend verification code if user is found", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        verificationCode: "654321",
        codeExpiresAt: new Date(Date.now() + 10000),
        save: jest.fn().mockResolvedValue(),
      };

      PendingUser.findOne = jest.fn().mockResolvedValue(mockUser);
      generateConfirmationCode.mockReturnValue("654321");
      sendConfirmationEmail.mockResolvedValue();

      const res = await request(app)
        .post("/api/v1/auth/resend-verification")
        .send({email: mockUser.email});

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Verification code resent successfully");
      expect(generateConfirmationCode).toHaveBeenCalled();
      expect(sendConfirmationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.username,
        "654321",
        process.env.SNDGRID_TEMPLATEID_REGESTRATION_EMAIL
      );
    });

    it("should return 404 if user is not found or already verified", async () => {
      PendingUser.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/auth/resend-verification")
        .send({email: "nonexistent@example.com"});

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found or already verified");
    });
  });
  afterAll(async () => {
    // Only disconnect if running in test environment
    if (process.env.NODE_ENV === "test") {
      console.log("Disconnecting Redis in test environment...");
      await disconnectPublsierAndSubscriber();
    }
  });
});
