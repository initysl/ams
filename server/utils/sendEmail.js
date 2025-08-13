import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// --- Transporter Setup ---
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// --- HTML Email Template ---
const getEmailTemplate = (title, content, buttonText, buttonUrl) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 40px 10px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.1);">
            <tr>
              <td align="center" style="padding: 30px 20px 10px;">
                <h2 style="font-size:24px; margin:0; color:#333333;">${title}</h2>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding: 0 30px 20px;">
                <div style="font-size:16px; color:#555555; line-height:1.6;">
                  ${content}
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px 30px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td align="center" bgcolor="#329932" style="border-radius:6px;">
                      <a href="${buttonUrl}" target="_blank" style="
                        display:inline-block;
                        padding:12px 24px;
                        font-size:16px;
                        font-weight:bold;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:6px;
                        background-color:#0000ff;
                      ">
                        ${buttonText}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px 20px 30px;">
                <p style="font-size:12px; color:#999999;">
                  This is an automated message. Please do not reply to this email.
                </p>
                <p style="font-size:12px; color:#999999;">
                  If you didn't request this, please ignore this email.
                </p>
                <p style="font-size:12px; color:#999999;">
                  &copy; ${new Date().getFullYear()} ${
    process.env.ORG_NAME || "TheFirst Studio"
  }. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

// --- Common email options with no-reply setup ---
const getBaseMailOptions = (to, subject) => {
  return {
    from: {
      name: `${process.env.APP_NAME || "AttendEase"} (No-Reply)`,
      address: process.env.NOREPLY_EMAIL || process.env.EMAIL_USER,
    },
    replyTo: process.env.SUPPORT_EMAIL || undefined, // Optional: redirect replies to support
    to: to,
    subject: subject,
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      "X-Mailer": `${process.env.APP_NAME || "AttendEase"} Email Service`,
      "X-Auto-Response-Suppress": "All", // Suppress auto-replies
      Precedence: "bulk", // Indicates bulk/automated email
    },
  };
};

// --- Verification Email ---
const sendVerificationEmail = async (email, token, userName = null) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const content = `
    <p>Hello${userName ? ` ${userName}` : ""},</p>
    <p>Thank you for signing up! We're excited to have you on board.</p>
    <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
    <p style="background:#fef3c7; padding:15px; border-left:4px solid #f59e0b; color:#92400e; font-size:14px;">
      <strong>Security Notice:</strong> This verification link is valid for 24 hours and can only be used once.
    </p>
  `;

  const mailOptions = {
    ...getBaseMailOptions(email, "Verify your account"),
    html: getEmailTemplate(
      "Verify Your Email Address",
      content,
      "Verify Email Address",
      verificationUrl
    ),
    text: `
Hello${userName ? ` ${userName}` : ""},

Thank you for signing up! Please verify your email address by visiting this link:
${verificationUrl}

This link is valid for 24 hours and can only be used once.

If you didn't request this, please ignore this email.

This is an automated message. Please do not reply to this email.
${
  process.env.SUPPORT_EMAIL
    ? `For support, contact us at: ${process.env.SUPPORT_EMAIL}`
    : ""
}

Best regards,  
${process.env.ORG_NAME || "TheFirst Studio"} Team
    `,
    priority: "high",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    throw new Error("Failed to send verification email");
  }
};

// --- Reset Password Email ---
const sendResetPasswordEmail = async (email, token, userName = null) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.CLIENT_URL}/reset?token=${token}`;

  const content = `
    <p>Hello${userName ? ` ${userName}` : ""},</p>
    <p>We received a request to reset your password.</p>
    <p>If you made this request, click the button below to reset it:</p>
    <p style="background:#fee2e2; padding:15px; border-left:4px solid #ef4444; color:#991b1b; font-size:14px;">
      <strong>Important:</strong> This password reset link will expire in 5 minutes.
    </p>
    <p style="background:#fef3c7; padding:15px; border-left:4px solid #f59e0b; color:#92400e; font-size:14px;">
      <strong>Security Tip:</strong> If you didn't request this, just ignore it.
    </p>
  `;

  const mailOptions = {
    ...getBaseMailOptions(email, "Reset your account password"),
    html: getEmailTemplate(
      "Reset Your Password",
      content,
      "Reset Password",
      resetUrl
    ),
    text: `
Hello${userName ? ` ${userName}` : ""},

We received a request to reset your password. Visit this link to proceed:
${resetUrl}

This link will expire in 5 minutes.

If you didn't request this, just ignore this email.

This is an automated message. Please do not reply to this email.
${
  process.env.SUPPORT_EMAIL
    ? `For support, contact us at: ${process.env.SUPPORT_EMAIL}`
    : ""
}

Best regards,  
${process.env.ORG_NAME || "TheFirst Studio"} Team
    `,
    priority: "high",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    throw new Error("Failed to send password reset email");
  }
};

// --- Welcome Email ---
const sendWelcomeEmail = async (email, userName) => {
  const transporter = createTransporter();
  const content = `
    <p>Hello ${userName},</p>
    <p>Welcome to ${process.env.APP_NAME || "our platform"}! 🎉</p>
    <p>Your account has been successfully verified. Here's how to get started:</p>
    <ul style="color: #4b5563; margin: 20px 0;">
      <li>Complete your profile to personalize your experience</li>
      <li>Explore our features and settings</li>
      <li>Check out our help center if you need assistance</li>
    </ul>
    <p>Let us know if you need any help — we're here for you!</p>
  `;

  const mailOptions = {
    ...getBaseMailOptions(
      email,
      `Welcome to ${process.env.APP_NAME || "AttendEase"}!`
    ),
    html: getEmailTemplate(
      `Welcome to ${process.env.APP_NAME || "AttendEase"}!`,
      content,
      "Get Started",
      process.env.CLIENT_URL || "#"
    ),
    text: `
Hello ${userName},

Welcome to ${process.env.APP_NAME || "AttendEase"}!

Your account has been successfully verified and you're ready to get started.

This is an automated message. Please do not reply to this email.
${
  process.env.SUPPORT_EMAIL
    ? `For support, contact us at: ${process.env.SUPPORT_EMAIL}`
    : ""
}

Best regards,  
${process.env.ORG_NAME || "TheFirst Studio"} Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    throw new Error("Failed to send welcome email");
  }
};

export { sendVerificationEmail, sendResetPasswordEmail, sendWelcomeEmail };
