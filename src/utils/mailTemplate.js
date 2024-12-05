exports.generateResetPasswordEmail = (resetUrl, resetToken) =>
  `Hi ,

We received a request to reset the password for your account. If you made this request, click the link below to reset your password:

${resetUrl}

Or your reset token:
${resetToken}

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

For security reasons, this link will expire in 1 hour. If you need assistance or didn't receive this request, please contact our support team.

Best regards,
TeleGrammy Support Team`;
