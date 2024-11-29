const axios = require("axios");

const reCaptchaVerification = async (req, res, next) => {
  try {
    const {token} = req.body;

    if (!token) {
      return res
        .status(400)
        .json({success: false, error: "Please confirm you are not a robot"});
    }

    const secret = process.env.CAPTCHA_SECRET;

    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret,
          response: token,
        },
      }
    );

    const {success} = response.data;
    if (success) {
      return next();
    }
    return res
      .status(400)
      .json({success: false, error: "Failed CAPTCHA validation"});
  } catch (err) {
    return res
      .status(500)
      .json({success: false, error: "Error verifying CAPTCHA"});
  }
};

module.exports = reCaptchaVerification;
