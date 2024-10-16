// eslint-disable-next-line import/no-extraneous-dependencies
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(`${process.env.SEND_API_KEY}`);

exports.sendConfirmationEmail= (userEmail,username, confirmationCode) =>{
  const msg = {
    to: userEmail,
    from: 'telegrammy.sw@gmail.com', 
    subject: 'Your Telegrammy Verification Code',
    templateId:"d-7540f28f471648b1801f1935010a6cb4",
    dynamic_template_data:{
      name:username,
      code:confirmationCode
    },
   };

   return sgMail.send(msg);
}

