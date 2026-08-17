import nodemailer from 'nodemailer';

const isConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USERNAME);

const transporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

export const sendEmail = async ({ email, subject, html }) => {
  // Without SMTP credentials the mail is logged instead of sent, so password
  // reset stays testable in development without a mail account.
  if (!isConfigured()) {
    console.log(`\n--- email to ${email} ---\n${subject}\n${html}\n---\n`);
    return { queued: false };
  }

  return transporter().sendMail({
    from: `${process.env.SMTP_FROM_NAME || 'Furniworld'} <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject,
    html,
  });
};

export const passwordResetEmail = (name, resetUrl) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#2A1B13">
    <h2 style="font-weight:600">Reset your Furniworld password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. This link is valid for 30 minutes.</p>
    <p style="margin:28px 0">
      <a href="${resetUrl}" style="background:#8A5A3B;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none">Choose a new password</a>
    </p>
    <p style="color:#6F4830;font-size:14px">If you did not request this, you can safely ignore this email.</p>
  </div>
`;
