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
    // Additional options to improve deliverability
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
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
    <style type="text/css">
      @media only screen and (max-width: 600px) {
        .email-container { width: 100% !important; }
        .email-content { padding: 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#f8fafc; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; line-height:1.6;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;">
      <tr>
        <td align="center" style="padding: 40px 15px;">
          <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.07); overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px;">
                <h1 style="font-size:28px; margin:0; color:#ffffff; font-weight:600; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${title}</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td class="email-content" style="padding: 40px 30px;">
                <div style="font-size:16px; color:#374151; line-height:1.7;">
                  ${content}
                </div>
              </td>
            </tr>
            
            <!-- Button Section -->
            <tr>
              <td align="center" style="padding: 20px 30px 40px;">
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border-radius:8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      <a href="${buttonUrl}" target="_blank" style="
                        display:inline-block;
                        padding:16px 32px;
                        font-size:16px;
                        font-weight:600;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:8px;
                        background: transparent;
                        transition: all 0.3s ease;
                        border: none;
                        outline: none;
                      " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        ${buttonText}
                      </a>
                    </td>
                  </tr>
                </table>
                
                <!-- Fallback link -->
                <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 6px; border-left: 4px solid #6366f1;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    <strong>Button not working?</strong> Copy and paste this link into your browser:
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 14px; word-break: break-all;">
                    <a href="${buttonUrl}" style="color: #6366f1; text-decoration: underline;">${buttonUrl}</a>
                  </p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                        This is an automated message from ${
                          process.env.APP_NAME || "AttendEase"
                        }
                      </p>
                      <p style="margin: 0 0 10px 0; font-size: 12px; color: #9ca3af;">
                        If you didn't request this action, please ignore this email or contact our support team.
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
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
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

// --- Common email options with anti-spam setup ---
const getBaseMailOptions = (to, subject) => {
  return {
    from: {
      name: process.env.APP_NAME || "AttendEase",
      address: process.env.EMAIL_USER,
    },
    replyTo: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
    to: to,
    subject: subject,
    headers: {
      "Message-ID": `<${Date.now()}.${Math.random()
        .toString(36)
        .substr(2, 9)}@${process.env.EMAIL_DOMAIN || "attendease.com"}>`,
      "X-Mailer": `${process.env.APP_NAME || "AttendEase"} v1.0`,
      "List-Unsubscribe": `<mailto:${
        process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      }?subject=Unsubscribe>`,
      Precedence: "auto-reply",
      "X-Auto-Response-Suppress": "OOF, DR, RN, NRN, AutoReply",
    },
    // Note: DKIM setup removed for simplicity - can be added later with proper domain setup
  };
};

// --- Verification Email ---
const sendVerificationEmail = async (email, token, userName = null) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.CLIENT_URL}/verify?token=${token}`;

  const content = `
    <p style="margin: 0 0 20px 0;">Hello${
      userName ? ` <strong>${userName}</strong>` : ""
    },</p>
    
    <p style="margin: 0 0 20px 0;">Thank you for joining ${
      process.env.APP_NAME || "AttendEase"
    }! We're excited to have you as part of our community.</p>
    
    <p style="margin: 0 0 20px 0;">To activate your account and start using all our features, please verify your email address by clicking the button below:</p>
    
    <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>🔒 Security Notice:</strong> This verification link expires in 24 hours and can only be used once. Keep this email secure.
      </p>
    </div>
  `;

  const mailOptions = {
    ...getBaseMailOptions(
      email,
      `Please verify your ${process.env.APP_NAME || "AttendEase"} account`
    ),
    html: getEmailTemplate(
      "Verify Your Email Address",
      content,
      "Verify Email",
      verificationUrl
    ),
    text: `
Hello${userName ? ` ${userName}` : ""},

Thank you for joining ${process.env.APP_NAME || "AttendEase"}!

To activate your account, please verify your email address by visiting:
${verificationUrl}

This verification link expires in 24 hours.

If you didn't create an account with us, please ignore this email.

Need help? Contact us at: ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}

Best regards,
The ${process.env.ORG_NAME || "TheFirst Studio"} Team
    `,
    priority: "normal", // Changed from "high" to avoid spam filters
  };

  try {
    const info = transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// --- Reset Password Email ---
const sendResetPasswordEmail = async (email, token, userName = null) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const content = `
    <p style="margin: 0 0 20px 0;">Hello${
      userName ? ` <strong>${userName}</strong>` : ""
    },</p>
    
    <p style="margin: 0 0 20px 0;">We received a request to reset the password for your ${
      process.env.APP_NAME || "AttendEase"
    } account.</p>
    
    <p style="margin: 0 0 20px 0;">Click the button below to create a new password:</p>
    
    <div style="background: #fee2e2; padding: 16px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        <strong>⚡ Important:</strong> This password reset link expires in 15 minutes for your security.
      </p>
    </div>
    
    <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
      <p style="margin: 0; color: #065f46; font-size: 14px;">
        <strong>💡 Didn't request this?</strong> Your account is still secure. You can safely ignore this email.
      </p>
    </div>
  `;

  const mailOptions = {
    ...getBaseMailOptions(
      email,
      `Reset your ${process.env.APP_NAME || "AttendEase"} password`
    ),
    html: getEmailTemplate(
      "Reset Your Password",
      content,
      "Reset My Password",
      resetUrl
    ),
    text: `
Hello${userName ? ` ${userName}` : ""},

We received a request to reset your ${
      process.env.APP_NAME || "AttendEase"
    } password.

To create a new password, visit:
${resetUrl}

This link expires in 15 minutes.

If you didn't request this reset, please ignore this email.

Need help? Contact us at: ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}

Best regards,
The ${process.env.ORG_NAME || "TheFirst Studio"} Team
    `,
    priority: "normal",
  };

  try {
    const info = transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// --- Welcome Email ---
const sendWelcomeEmail = async (email, userName) => {
  const transporter = createTransporter();
  const dashboardUrl = `${process.env.CLIENT_URL}/dashboard`;

  const content = `
    <p style="margin: 0 0 20px 0;">Hello <strong>${userName}</strong>,</p>
    
    <p style="margin: 0 0 20px 0;">🎉 Welcome to ${
      process.env.APP_NAME || "AttendEase"
    }! Your account has been successfully verified and you're all set to go.</p>
    
    <p style="margin: 0 0 20px 0;">Here's what you can do next:</p>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
      <ul style="color: #0c4a6e; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Complete your profile to personalize your experience</li>
        <li style="margin-bottom: 8px;">Explore our dashboard and discover all features</li>
        <li style="margin-bottom: 8px;">Check out our help center for tips and guides</li>
        <li>Join our community and connect with other users</li>
      </ul>
    </div>
    
    <p style="margin: 20px 0;">Ready to get started? Click the button below to access your dashboard:</p>
  `;

  const mailOptions = {
    ...getBaseMailOptions(
      email,
      `Welcome to ${process.env.APP_NAME || "AttendEase"} - You're all set! 🎉`
    ),
    html: getEmailTemplate(
      `Welcome to ${process.env.APP_NAME || "AttendEase"}!`,
      content,
      "Go to Dashboard",
      dashboardUrl
    ),
    text: `
Hello ${userName},

Welcome to ${process.env.APP_NAME || "AttendEase"}! 

Your account has been successfully verified and you're ready to get started.

Visit your dashboard: ${dashboardUrl}

What's next:
- Complete your profile
- Explore our features
- Check out the help center
- Connect with the community

Need help? Contact us at: ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}

Best regards,
The ${process.env.ORG_NAME || "TheFirst Studio"} Team
    `,
    priority: "normal",
  };

  try {
    const info = transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

export { sendVerificationEmail, sendResetPasswordEmail, sendWelcomeEmail };
