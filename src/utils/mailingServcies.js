const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendConfirmationEmail = (
  userEmail,
  username,
  confirmationCode,
  templateId
) => {
  const msg = {
    to: userEmail,
    from: "telegrammy.sw@gmail.com",
    subject: "Your Telegrammy Verification Code",
    templateId,
    dynamic_template_data: {
      name: username,
      code: confirmationCode,
    },
  };

  return sgMail.send(msg);
};
