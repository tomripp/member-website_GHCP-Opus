import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'myWebsite <onboarding@resend.dev>';

export async function sendVerificationEmail(email: string, token: string, locale: string = 'en') {
  const verifyUrl = `${APP_URL}/${locale}/auth/verify-email?token=${token}`;

  const subjects = {
    en: 'Verify your email - myWebsite',
    de: 'E-Mail bestätigen - myWebsite',
  };

  const subject = subjects[locale as keyof typeof subjects] || subjects.en;

  const htmlContent = locale === 'de'
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af; text-align: center;">myWebsite</h1>
        <h2 style="color: #334155;">E-Mail-Adresse bestätigen</h2>
        <p style="color: #475569; font-size: 16px;">Vielen Dank für Ihre Registrierung! Bitte klicken Sie auf den Button unten, um Ihre E-Mail-Adresse zu bestätigen.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px;">E-Mail bestätigen</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">Falls Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 myWebsite. Alle Rechte vorbehalten.</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af; text-align: center;">myWebsite</h1>
        <h2 style="color: #334155;">Verify Your Email Address</h2>
        <p style="color: #475569; font-size: 16px;">Thank you for registering! Please click the button below to verify your email address.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px;">Verify Email</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 myWebsite. All rights reserved.</p>
      </div>
    `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject,
    html: htmlContent,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, locale: string = 'en') {
  const resetUrl = `${APP_URL}/${locale}/auth/reset-password?token=${token}`;

  const subjects = {
    en: 'Reset your password - myWebsite',
    de: 'Passwort zurücksetzen - myWebsite',
  };

  const subject = subjects[locale as keyof typeof subjects] || subjects.en;

  const htmlContent = locale === 'de'
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af; text-align: center;">myWebsite</h1>
        <h2 style="color: #334155;">Passwort zurücksetzen</h2>
        <p style="color: #475569; font-size: 16px;">Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den Button unten, um ein neues Passwort festzulegen.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px;">Passwort zurücksetzen</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">Dieser Link ist 1 Stunde gültig. Falls Sie kein Zurücksetzen angefordert haben, ignorieren Sie diese E-Mail.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 myWebsite. Alle Rechte vorbehalten.</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af; text-align: center;">myWebsite</h1>
        <h2 style="color: #334155;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 16px;">You requested to reset your password. Click the button below to set a new password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">This link is valid for 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 myWebsite. All rights reserved.</p>
      </div>
    `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject,
    html: htmlContent,
  });
}
