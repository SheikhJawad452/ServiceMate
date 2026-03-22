export const otpEmailTemplate = ({ fullName, otpCode, expiryMinutes }) => `
  <div style="font-family: Arial, sans-serif; color: #111827;">
    <h2 style="color: #1E3A8A; margin-bottom: 8px;">ServiceMate Email Verification</h2>
    <p>Hello ${fullName},</p>
    <p>Your verification code is:</p>
    <p style="font-size: 28px; letter-spacing: 4px; font-weight: 700; color: #F97316; margin: 16px 0;">
      ${otpCode}
    </p>
    <p>This code will expire in ${expiryMinutes} minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  </div>
`;
