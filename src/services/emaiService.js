import nodemailer from 'nodemailer';

// Create transporter using SMTP settings
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Function to send verification email with OTP
export const sendVerificationEmail = async (email, otp) => {
  try {
    // Email template
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email - InCampus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">InCampus</h1>
          </div>
          
          <div style="background: #1a1a1a; padding: 30px; color: white; border-radius: 0 0 10px 10px;">
            <h2 style="margin-top: 0; text-align: center;">Verify Your Email</h2>
            
            <p style="color: #9ca3af; line-height: 1.6;">
              Thanks for signing up! Please use the verification code below to complete your registration:
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; letter-spacing: 8px; font-family: monospace; color: #60a5fa;">
                ${otp}
              </span>
            </div>
            
            <p style="color: #9ca3af; line-height: 1.6;">
              This code will expire in 10 minutes. If you didn't request this verification, you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p>© ${new Date().getFullYear()} InCampus. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');

  } catch (error) {
    console.error('Send verification email error:', error);
    throw new Error('Failed to send verification email');
  }
};

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
}); 