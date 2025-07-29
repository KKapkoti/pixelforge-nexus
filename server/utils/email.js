const nodemailer = require('nodemailer');

let transporter = null;

exports.initEmailTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

exports.sendEmail = async (to, subject, text) => {
  if (!transporter) throw new Error("Transporter not initialized. Call initEmailTransporter() first.");

  const info = await transporter.sendMail({
    from: '"PixelForge Nexus" <noreply@pixelforge.com>',
    // from: '"k k" <kavitamiss643@gmail.com>',
    to,
    subject,
    text,
  });

  console.log(" Message sent: %s", info.messageId);
  console.log(" Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
