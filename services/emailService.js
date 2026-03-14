
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Use App Password for Gmail
  },
});


const sendOTPEmail = async (email, otp) => {
  try {
    console.log(`📧 Attempting to send OTP email to: ${email}`);
    console.log(`🔐 OTP Code: ${otp} (valid for 5 minutes)`);
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: '🔐 Your Tripora OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for Tripora is:</p>
          
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          
          <p><strong>⏰ This OTP will expire in 5 minutes</strong></p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this code, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            © 2026 Tripora. All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully!');
    console.log(`   Response: ${info.response}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send OTP email');
    console.error(`   Error: ${error.message}`);
    console.error(`   SMTP User: ${process.env.SMTP_USER}`);
    console.error(`   To: ${email}`);
    
    // In development, log more details
    if (process.env.NODE_ENV === 'development') {
      console.error(`   Full Error:`, error);
    }
    
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    console.log(`📧 Sending welcome email to: ${email}`);
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: '🎉 Welcome to Tripora!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Tripora!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with Tripora - Your AI Travel Guide.</p>
          <p>Your email has been verified and your account is now active.</p>
          
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff;">Get Started</h3>
            <ul>
              <li>Complete your profile</li>
              <li>Explore destinations</li>
              <li>Get AI-powered recommendations</li>
            </ul>
          </div>
          
          <p>Happy travels!<br>Team Tripora</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            © 2026 Tripora. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('⚠️  Warning: Failed to send welcome email');
    console.error(`   Error: ${error.message}`);
    return false;
  }
};


const verifyConnection = async () => {
  try {
    console.log('🔍 Testing Email Service Connection...');
    console.log(`   SMTP User: ${process.env.SMTP_USER}`);
    console.log(`   From Email: ${process.env.FROM_EMAIL}`);
    
    await transporter.verify();
    
    console.log('✅ Email Service Connected & Ready!');
    console.log('   ✓ SMTP Connection Verified');
    console.log('   ✓ Gmail Credentials Valid');
    console.log('   ✓ Ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email Service Connection Failed!');
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('🔧 Troubleshooting Checklist:');
    console.error('   ❌ Check Gmail Credentials:');
    console.error(`      - SMTP_USER: ${process.env.SMTP_USER}`);
    console.error(`      - SMTP_PASS: ${process.env.SMTP_PASS ? '[SET]' : '[NOT SET]'}`);
    console.error('   ❌ Verify Gmail App Password:');
    console.error('      1. Go to: https://myaccount.google.com/apppasswords');
    console.error('      2. Select: Mail → Windows Computer');
    console.error('      3. Generate 16-character app password');
    console.error('      4. Update SMTP_PASS in .env file');
    console.error('   ❌ Enable Less Secure App Access (if using personal Gmail):');
    console.error('      1. Go to: https://myaccount.google.com/security');
    console.error('      2. Enable "Less secure app access" (not recommended but works)');
    console.error('   ❌ Verify 2FA is enabled on Gmail account');
    console.error('');
    console.error('⚠️  OTP emails will NOT be sent until email service is fixed!');
    return false;
  }
};

const sendTestEmail = async (toEmail) => {
  try {
    console.log(`📧 Sending test email to: ${toEmail}`);
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: toEmail,
      subject: '🔧 Tripora Email Service Test',
      text: 'If you received this, email service is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #007bff;">Email Service Test</h2>
          <p>If you received this email, the SMTP configuration is working correctly!</p>
          <p>Current Time: ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #999; font-size: 12px;">This is a test email from Tripora</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log(`   Response: ${info.response}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send test email');
    console.error(`   Error: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  verifyConnection,
  sendTestEmail,
};
