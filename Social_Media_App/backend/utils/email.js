import nodemailer from "nodemailer";
import crypto from "crypto";

export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export function getOTPExpiry() {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  return expiry;
}

export async function sendOTPEmail(userEmail, otp) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "mangarajanmol666@gmail.com",
        pass: "dcud kflh ldbw kpua",
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: {
        name: "Twitter Backend",
        address: "mangarajanmol666@gmail.com",
      },
      to: userEmail,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1da1f2;">Your OTP Verification Code</h2>
          <p>Hello,</p>
          <p>Your OTP code is: <strong style="font-size: 24px; color: #1da1f2;">${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}
