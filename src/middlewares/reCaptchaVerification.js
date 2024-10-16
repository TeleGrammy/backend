const axios = require("axios");

const reCaptchaVerification = async (req, res, next) => {
  try {
    const token = req.body["g-recaptcha-response"];

    if (!token) {
      const err = new Error("Please confirm you are not a robot");
      err.isOperational = true;
      err.status = 400;
      next(err);
    }

    const secret = "6LcQJGEqAAAAAKsQLKf2px_YWol7Z2_NCUn1JPAi";

    const {data: response} = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret,
          response: token,
        },
      },
    );

    if (response.success === true) return next();

    const error = new Error("Failed captcha verification");
    error.statusCode = 400;
    error["error-codes"] = response["error-codes"];
    return next(error);
  } catch (err) {
    return next(err);
  }
};

module.exports = reCaptchaVerification;
