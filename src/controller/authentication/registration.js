const bcrypt = require("bcrypt");
const PendingUser = require("../../models/pending-user");

const User = require("../../models/user");

const {generateConfirmationCode} = require("../../utils/codeGenerator");

const {sendConfirmationEmail} = require("../../utils/mailingServcies");

const phoneRegex = /^\+20[0-9]{10}$/;

exports.postRegistration = async (req, res) => {
  const {username, email, password, confirmPassword, phone} = req.body;

  if (!username) {
    return res.status(400).json({message: "Username is required"});
  }
  if (!email) {
    return res.status(400).json({message: "Email is required"});
  }
  if (!password) {
    return res.status(400).json({message: "Password is required"});
  }
  if (!confirmPassword) {
    return res.status(400).json({message: "Confirm Password is required"});
  }
  if (!phone) {
    return res.status(400).json({message: "Phone is required"});
  }

  if (password !== confirmPassword) {
    return res.status(400).json({message: "Passwords do not match"});
  }

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({message: "Invalid phone number format"});
  }

  try {
    const existingUser = await User.findOne({
      $or: [{email}, {username}, {phone}],
    });

    console.log(existingUser);
    if (existingUser) {
      let message = "The following fields already exists: ";
      if (existingUser) {
        if (existingUser.email === email) message += `Email `;
        if (existingUser.username === username) message += `Username `;
        if (existingUser.phone === phone) message += `Phone `;
      }
      return res.status(409).json({message: message.trim()});
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationCode = generateConfirmationCode();

    const newUser = new PendingUser({
      username,
      email,
      password: hashedPassword,
      phone,
      verificationCode,
    });

    await newUser.save();
    await sendConfirmationEmail(email, username, verificationCode);

    return res.status(201).json({
      message:
        "Registration successful. Please check your email for the verification code.",
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[field];
      return res.status(409).json({
        field,
        message: `The ${field} '${duplicateValue}' is already in use. Please choose a different one.`,
      });
    }
    if (error.name === "ValidationError") {
      const field = Object.keys(error.keyValue)[0];
      return res
        .status(409)
        .json({field, message: error.errors[field].message});
    }
    return res.status(500).json({message: "Server error"});
  }
};

exports.postVerfiy = async (req, res) => {
  const {email, verificationCode} = req.body;

  if (!email) {
    return res.status(400).json({message: "Email is required"});
  }
  if (!verificationCode) {
    return res.status(400).json({message: "Verification code is required"});
  }
  try {
    const pendingUser = await PendingUser.findOne({email});

    if (!pendingUser) {
      return res.status(404).json({message: "User not found"});
    }

    if (pendingUser.verificationCode !== verificationCode) {
      return res.status(400).json({message: "Invalid verification code"});
    }

    if (pendingUser.codeExpiresAt < new Date()) {
      return res.status(400).json({message: "Verification code has expired"});
    }

    const newUser = new User({
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password,
      phone: pendingUser.phone,
    });

    await newUser.save();

    await PendingUser.deleteOne({email});

    return res.status(200).json({message: "Account verified successfully"});
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[field];
      return res.status(409).json({
        field,
        message: `The ${field} '${duplicateValue}' is already in use. Please choose a different one.`,
      });
    }
    if (error.name === "ValidationError") {
      const field = Object.keys(error.keyValue)[0];
      return res
        .status(409)
        .json({field, message: error.errors[field].message});
    }
    return res.status(500).json({message: "Server error"});
  }
};

exports.resendVerification = async (req, res) => {
  const {email} = req.body;
  if (!email) {
    return res.status(400).json({message: "Email is required"});
  }
  try {
    const pendingUser = await PendingUser.findOne({email});

    if (!pendingUser) {
      return res
        .status(404)
        .json({message: "User not found or already verified"});
    }

    const newVerificationCode = generateConfirmationCode();

    pendingUser.verificationCode = newVerificationCode;
    pendingUser.codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pendingUser.save();

    await sendConfirmationEmail(
      pendingUser.email,
      pendingUser.username,
      newVerificationCode
    );

    return res
      .status(200)
      .json({message: "Verification code resent successfully"});
  } catch (error) {
    console.error("Error resending verification code:", error);
    return res
      .status(500)
      .json({message: "Server error, please try again later"});
  }
};
