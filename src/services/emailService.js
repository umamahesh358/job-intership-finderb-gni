const nodemailer = require('nodemailer');

let transporter;

const getTransporter = async () => {
  if (!transporter) {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Generate test account if no credentials are provided
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass  // generated ethereal password
        }
      });
    }
  }
  return transporter;
};

const sendMagicLink = async (email, token) => {
  const currentTransporter = await getTransporter();
  const link = `http://localhost:3000/auth/verify?token=${token}&email=${email}`;

  const mailOptions = {
    from: '"CareerOS" <noreply@careeros.com>',
    to: email,
    subject: 'Your Login Link for CareerOS',
    text: `Click this link to login: ${link}`,
    html: `<p>Click <a href="${link}">here</a> to login.</p>`
  };

  try {
    const info = await currentTransporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error("Error sending email", error);
    throw error;
  }
};

module.exports = {
  sendMagicLink
};
