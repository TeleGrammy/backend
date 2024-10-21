const sgMail = require("@sendgrid/mail");

const sendMail = (msg) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  sgMail.send(msg);
};

module.exports = sendMail;
