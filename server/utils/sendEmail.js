import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // debug: process.env.NODE_ENV === "development",
    // logger: process.env.NODE_ENV === "development",
  });
};

// Email templates
const getEmailTemplate = (title, content, buttonText, buttonUrl) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          font-size: 24px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          color: #1f2937;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .content {
          color: #4b5563;
          font-size: 16px;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        .button {
          display: inline-block;
          background-color: #60a5fa;
          color: #fff;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(96, 165, 250, 0.3);
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .security-note {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
          color: #92400e;
        }
        .expiry-notice {
          background: #fee2e2;
          border-left: 4px solid #ef4444;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
          color: #991b1b;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .container {
            padding: 20px;
          }
          .title {
            font-size: 20px;
          }
          .button {
            padding: 12px 24px;
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${process.env.APP_NAME || "AttendEase"}</div>
        </div>
        
        <h1 class="title">${title}</h1>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="button-container">
          <a href="${buttonUrl}" class="button">${buttonText}</a>
        </div>
        
        <div class="footer">
          <p>If you didn't request this action, please ignore this email or contact our support team.</p>
          <p>This email was sent from ${
            process.env.APP_NAME || "AttendEase"
          }</p>
          <p>&copy; ${new Date().getFullYear()} TheFirst Studio. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendVerificationEmail = async (email, token, userName = null) => {
  const transporter = createTransporter();

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const content = `
    <p>Hello${userName ? ` ${userName}` : ""},</p>
    <p>Thank you for signing up! We're excited to have you on board.</p>
    <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
    
    <div class="security-note">
      <strong>Security Notice:</strong> This verification link is valid for 24 hours and can only be used once.
    </div>
  `;

  const mailOptions = {
    from: {
      name: process.env.APP_NAME || "AttendEase",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "Verify your account",
    html: getEmailTemplate(
      "Verify Your Email Address",
      content,
      "Verify Email Address",
      verificationUrl
    ),
    // Text fallback
    text: `
      Hello${userName ? ` ${userName}` : ""},
      
      Thank you for signing up! Please verify your email address by visiting this link:
      ${verificationUrl}
      
      This link is valid for 24 hours and can only be used once.
      
      If you didn't request this, please ignore this email.
      
      Best regards,
      ${process.env.ORG_NAME || "TheFirst Studio"} Team
    `,
    priority: "high",
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      "X-Mailer": `${process.env.APP_NAME || "AttendEase"} Email Service`,
    },
  };

  try {
    const info = transporter.sendMail(mailOptions);
    // console.log("Verification email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

const sendResetPasswordEmail = async (email, token, userName = null) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.CLIENT_URL}/reset?token=${token}`;

  const content = `
    <p>Hello${userName ? ` ${userName}` : ""},</p>
    <p>We received a request to reset the password for your account associated with this email address.</p>
    <p>If you made this request, click the button below to reset your password:</p>
    
    <div class="expiry-notice">
      <strong>Important:</strong> This password reset link will expire in 5 minutes.
    </div>
    
    <div class="security-note">
      <strong>Security Tip:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
    </div>

    
    <p>For your security, this link can only be used once and will expire automatically.</p>
  `;

  const mailOptions = {
    from: {
      name: process.env.APP_NAME || "AttendEase",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "Reset your account password",
    html: getEmailTemplate(
      "Reset Your Password",
      content,
      "Reset Password",
      resetUrl
    ),
    // Text fallback
    text: `
      Hello${userName ? ` ${userName}` : ""},
      
      We received a request to reset your password. If you made this request, visit this link:
      ${resetUrl}
      
      This link will expire in 5 minutes.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      ${process.env.ORG_NAME || "TheFirst Studio"} Team
    `,
    priority: "high",
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      "X-Mailer": `${process.env.APP_NAME || "Your App"} Email Service`,
    },
  };

  try {
    const info = transporter.sendMail(mailOptions);
    // console.log("Password reset email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

// Additional utility function for welcome emails
const sendWelcomeEmail = async (email, userName) => {
  const transporter = createTransporter();

  const content = `
    <p>Hello ${userName},</p>
    <p>Welcome to ${process.env.APP_NAME || "our platform"}! 🎉</p>
    <p>Your account has been successfully verified and you're all set.</p>
    <p>Here are some quick tips to get you started:</p>
    <ul style="color: #4b5563; margin: 20px 0;">
      <li>Complete your profile to personalize your experience</li>
      <li>Explore our features and settings</li>
      <li>Check out our help center if you need assistance</li>
    </ul>
    <p>If you have any questions or need help, don't hesitate to reach out to our support team.</p>
    <p>Happy attendance!</p>
  `;

  const mailOptions = {
    from: {
      name: process.env.APP_NAME || "AttendEase",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: `Welcome to ${process.env.APP_NAME || "AttendEase"}!`,
    html: getEmailTemplate(
      `Welcome to ${process.env.APP_NAME || "AttendEase"}!`,
      content,
      "Get Started",
      process.env.CLIENT_URL || "#"
    ),
    text: `
      Hello ${userName},
      
      Welcome to ${process.env.APP_NAME || "AttendEase"}!
      
      Your account has been successfully verified and you're ready to start exploring.
      
      If you have any questions, feel free to contact our support team.
      
      Best regards,
      ${process.env.ORG_NAME || "TheFirst Studio"} Team
    `,
  };

  try {
    const info = transporter.sendMail(mailOptions);
    // console.log("Welcome email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

export { sendVerificationEmail, sendResetPasswordEmail, sendWelcomeEmail };
