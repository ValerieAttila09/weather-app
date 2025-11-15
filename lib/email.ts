import nodemailer from 'nodemailer';

let transporter: any = null;

export async function getEmailTransporter() {
  if (transporter) return transporter;

  // Use provided email server or create test account
  if (process.env.EMAIL_SERVER) {
    transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
  } else {
    // Fallback: test mode (logs instead)
    console.warn('EMAIL_SERVER not set - email sending disabled (test mode)');
    transporter = {
      sendMail: async (opts: any) => {
        console.log('[EMAIL TEST MODE]', opts.subject, 'to', opts.to);
        return { messageId: 'test-' + Date.now() };
      },
    };
  }

  return transporter;
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  firstName?: string
) {
  const transporter = await getEmailTransporter();
  const name = firstName || 'User';

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@weatherapp.com',
      to: email,
      subject: 'Reset Your Password - Weather App',
      html: `
        <h2>Hello ${name},</h2>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending reset email:', error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  verifyLink: string,
  firstName?: string
) {
  const transporter = await getEmailTransporter();
  const name = firstName || 'User';

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@weatherapp.com',
      to: email,
      subject: 'Verify Your Email - Weather App',
      html: `
        <h2>Welcome to Weather App, ${name}!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${verifyLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}
