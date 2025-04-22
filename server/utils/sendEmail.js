import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `<p>Please verify your email by clicking the following link:</p>
           <a href="${process.env.CLIENT_URL}/verify-email?token=${token}">Verify Email</a>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendResetPasswordEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset your password",
    html: `<p>Please reset your password by clicking the following link:</p>
           <a href="${process.env.CLIENT_URL}/reset?token=${token}">Reset Password</a>`,
  };
  await transporter.sendMail(mailOptions);
};
export { sendVerificationEmail, sendResetPasswordEmail };
