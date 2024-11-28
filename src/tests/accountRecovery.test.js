/* eslint-disable no-undef */
// eslint-disable-next-line node/no-unpublished-require
const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../expressApp");

const userService = require("../services/userService");
const AppError = require("../errors/appError");
const manageSessionForUser = require("../utils/sessionManagement");

const isAuthenticated = require("../middlewares/isAuthenticated");

jest.mock("jsonwebtoken");
jest.mock("../services/userService");
jest.mock("../utils/mailTemplate");
jest.mock("../utils/sendEmail");
jest.mock("../utils/sessionManagement");
jest.mock("../middlewares/isAuthenticated");

describe("POST /api/v1/auth/forget-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should send a password reset email", async () => {
    const req = {
      body: {
        email: "test@example.com",
      },
    };
    const user = {
      email: "test@example.com",
      createResetPasswordToken: jest.fn().mockReturnValue("resetToken"),
      save: jest.fn(),
    };

    userService.getUserByEmail.mockResolvedValue(user);

    const response = await supertest(app)
      .post("/api/v1/auth/forget-password")
      .send(req.body);

    expect(user.save).toHaveBeenCalledWith({validateBeforeSave: false});
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      data: {},
      message: `Sent Email successfully. (Valid for ${process.env.RESET_PASSWORD_TOKEN_DURATION} minutes)`,
    });
  });

  test("should return an error if email is not provided", async () => {
    const response = await supertest(app)
      .post("/api/v1/auth/forget-password")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "fail",
      message: "Email field is required. Please enter your email!",
    });
  });

  test("should return an error if user isn't found", async () => {
    userService.getUserByEmail.mockResolvedValue(null);

    const response = await supertest(app)
      .post("/api/v1/auth/forget-password")
      .send({email: "nonexistent@example.com"});

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: "fail",
      message: "We couldn’t find your Email.",
    });
  });
});

describe("POST /api/v1/auth/reset-password/resend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should resend the password reset email", async () => {
    const req = {
      body: {
        email: "test@example.com",
      },
    };

    const user = {
      email: "test@example.com",
      passwordResetTokenExpiresAt: Date.now() + 10 * 60 * 1000,
      lastPasswordResetRequestAt:
        Date.now() -
        (process.env.RESEND_PASSWORD_TOKEN_COOLDOWN + 2) * 60 * 1000,
      createResetPasswordToken: jest.fn().mockReturnValue("resetToken"),
      save: jest.fn(),
    };

    userService.getUserByEmail.mockResolvedValue(user);

    const response = await supertest(app)
      .post("/api/v1/auth/reset-password/resend")
      .send(req.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      data: {},
      message: `Resend Email successfully. (Valid for ${process.env.RESET_PASSWORD_TOKEN_DURATION} minutes)`,
    });
  });

  test("should return an error if user is not found", async () => {
    userService.getUserByEmail.mockResolvedValue(null);

    const response = await supertest(app)
      .post("/api/v1/auth/reset-password/resend")
      .send({email: "nonexistent@example.com"});

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: "fail",
      message: "We couldn’t find your Email.",
    });
  });

  test("should wait a certain time to resend another mail", async () => {
    const req = {
      body: {
        email: "test@example.com",
      },
    };

    const user = {
      email: "test@example.com",
      passwordResetTokenExpiresAt: Date.now() + 10 * 60 * 1000,
      lastPasswordResetRequestAt: Date.now(),
      createResetPasswordToken: jest.fn().mockReturnValue("resetToken"),
      save: jest.fn(),
    };

    userService.getUserByEmail.mockResolvedValue(user);

    const response = await supertest(app)
      .post("/api/v1/auth/reset-password/resend")
      .send(req.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "fail",
      message: `You need to wait ${process.env.RESEND_PASSWORD_TOKEN_COOLDOWN} minutes from the last sent reset password email before resending. Please try again later.`,
    });
  });

  test("should use forget password option again", async () => {
    const req = {
      body: {
        email: "test@example.com",
      },
    };

    const user = {
      email: "test@example.com",
      passwordResetTokenExpiresAt: Date.now() - 10 * 60 * 1000,
      lastPasswordResetRequestAt:
        Date.now() -
        (process.env.RESEND_PASSWORD_TOKEN_COOLDOWN + 2) * 60 * 1000,
      createResetPasswordToken: jest.fn().mockReturnValue("resetToken"),
      save: jest.fn(),
    };

    userService.getUserByEmail.mockResolvedValue(user);

    const response = await supertest(app)
      .post("/api/v1/auth/reset-password/resend")
      .send(req.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "fail",
      message:
        "The password reset token is invalid. Please use Forget Password option again.",
    });
  });
});

describe("PATCH /api/v1/auth/reset-password/{token}", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should reset the password", async () => {
    const req = {
      body: {
        password: "password123",
        passwordConfirm: "password123",
      },
      params: {
        token: "Reset Token",
      },
    };

    const user = {
      _id: "id",
      name: "name",
      email: "test@example.com",
      phone: "01010101",
      passwordResetTokenExpiresAt: Date.now() + 10 * 60 * 1000,
    };
    const accessToken = "access-token";

    userService.findOne.mockResolvedValue(user);
    userService.findOneAndUpdate.mockResolvedValue(user);
    manageSessionForUser.default.mockResolvedValue({
      updatedUser: user,
      accessToken,
    });

    const response = await supertest(app)
      .patch(`/api/v1/auth/reset-password/${req.params.token}`)
      .send(req.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      data: {
        user,
        accessToken,
      },
      message: "The password is reset successfully.",
    });
  });

  test("should return an error if password or passwordConfirm is not available", async () => {
    const req = {
      body: {
        password: "password123",
      },
      params: {
        token: "Reset Token",
      },
    };

    const user = {
      _id: "id",
      name: "name",
      email: "test@example.com",
      phone: "01010101",
      passwordResetTokenExpiresAt: Date.now() + 10 * 60 * 1000,
    };

    userService.findOne.mockResolvedValue(user);

    const response = await supertest(app)
      .patch(`/api/v1/auth/reset-password/${req.params.token}`)
      .send(req.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "fail",
      message: "Password and PasswordConfirm are required fields.",
    });
  });

  test("should return an error if the token is invalid", async () => {
    const req = {
      body: {
        password: "password123",
        passwordConfirm: "password123",
      },
      params: {
        token: "Reset Token",
      },
    };

    userService.findOne.mockResolvedValue(null);

    const response = await supertest(app)
      .patch(`/api/v1/auth/reset-password/${req.params.token}`)
      .send(req.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "fail",
      message: "The reset token is invalid.",
    });
  });

  test("should renew the reset token", async () => {
    const req = {
      body: {
        password: "password123",
        passwordConfirm: "password123",
      },
      params: {
        token: "Reset Token",
      },
    };

    const user = {
      _id: "id",
      name: "name",
      email: "test@example.com",
      phone: "01010101",
      passwordResetTokenExpiresAt: Date.now() - 10 * 60 * 1000,
    };

    userService.findOne.mockResolvedValue(user);

    const response = await supertest(app)
      .patch(`/api/v1/auth/reset-password/${req.params.token}`)
      .send(req.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "fail",
      message: "The reset token is expired.",
    });
  });

  test("should return error if the password and password confirm are not matching", async () => {
    const req = {
      body: {
        password: "password123",
        passwordConfirm: "password123",
      },
      params: {
        token: "Reset Token",
      },
    };

    const user = {
      _id: "id",
      name: "name",
      email: "test@example.com",
      phone: "01010101",
      passwordResetTokenExpiresAt: Date.now() + 1000 * 60 * 1000,
      save: jest.fn().mockImplementation(() => {
        throw new Error("Passwords do not match");
      }),
    };
    userService.findOne.mockResolvedValue(user);

    userService.findOneAndUpdate.mockRejectedValue(
      new AppError("Password and passwordConfirm are different.", 400)
    );

    const response = await supertest(app)
      .patch(`/api/v1/auth/reset-password/${req.params.token}`)
      .send(req.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "fail",
      message: "Password and passwordConfirm are different.",
    });
  });
});

describe("POST /api/v1/auth/logout-from-all-devices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should logout from all devices successfully ", async () => {
    req = {
      headers: {
        "user-agent": "Mozilla/5.0",
        authorization: "token",
      },
      cookies: {},
      body: {
        email: "test@example.com",
        currentSession: {
          _id: new mongoose.Types.ObjectId(),
        },
      },
    };

    const decodedToken = {
      email: "test@example.com",
    };

    jwt.verify.mockImplementation((token) => {
      if (token === "validToken") {
        return decodedToken;
      }
      return new Error("Invalid token");
    });

    isAuthenticated.mockImplementation(async (req, res, next) => {
      return next();
    });

    const user = {
      _id: "id",
      name: "name",
      email: "test@example.com",
      phone: "01010101",
      passwordResetTokenExpiresAt: Date.now() + 1000 * 60 * 1000,
    };

    const accessToken = "access-token";

    jwt.verify("validToken");
    userService.findOneAndUpdate.mockResolvedValue(user);
    manageSessionForUser.default.mockResolvedValue({
      updatedUser: user,
      accessToken,
    });

    const response = await supertest(app)
      .post("/api/v1/auth/logout-from-all-devices")
      .send(req.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      data: {
        user,
        accessToken,
      },
      message: "logged out successfully from all devices",
    });
  });

  test("should return an error if user is not authenticated", async () => {
    isAuthenticated.mockImplementation((req, res, next) => {
      next(new AppError("Not authenticated", 401));
    });

    const response = await supertest(app)
      .post("/api/v1/auth/logout-from-all-devices")
      .send({});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "fail",
      message: "Not authenticated",
    });
  });
});
