const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer"); // 1. Import Nodemailer
const { db } = require("../config/firebase");
const verifyToken = require("../middleware/auth");

// Temporary in-memory storage for pending registration OTP validations
const otpCache = new Map();

// 2. Configure Nodemailer Transporter using your .env variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @route   POST /send-otp
 * @desc    Generates, maps, and emails a 6-digit verification code to the active user context
 * @access  Protected
 */
router.post("/send-otp", verifyToken, async (req, res) => {
  const userEmail = req.user.email;

  if (!userEmail) {
    return res.status(400).json({ success: false, error: "Authentication context missing user email properties." });
  }

  try {
    // Generate a secure, randomized 6-digit string
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = Date.now() + 5 * 60 * 1000; // Codes automatically expire in 5 minutes

    // Store properties directly linked against the user profile's primary email key
    otpCache.set(userEmail, { code: generatedOtp, expiresAt: expiryTime });

    // 3. ACTUAL EMAIL DISPATCH LAYER
    const mailOptions = {
      from: `"HireNext Team" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Verify Your HireNext Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1976d2; text-align: center;">Welcome to HireNext!</h2>
          <p>Thank you for signing up. Please use the following One-Time Password (OTP) to complete your profile registration. This code is valid for <strong>5 minutes</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 6px; background-color: #f5f5f5; padding: 10px 20px; border-radius: 4px; border: 1px dashed #1976d2;">
              ${generatedOtp}
            </span>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center;">If you did not request this code, please ignore this email.</p>
        </div>
      `,
    };

    // Send the email asynchronously
    await transporter.sendMail(mailOptions);
    console.log(`[OTP Sent Successfully to ${userEmail}]`);

    res.status(200).json({ success: true, message: "Verification OTP dispatched successfully!" });
  } catch (error) {
    console.error("Error dispatching registration verification code:", error);
    res.status(500).json({ success: false, error: "Failed to issue registration verification token." });
  }
});

/**
 * @route   POST /register-profile
 * @desc    Validates submitted security codes before performing atomic Firestore document storage operations
 * @access  Protected
 */
router.post("/register-profile", verifyToken, async (req, res) => {
  const { firstName, lastName, role, otp } = req.body; 
  const userUid = req.user.uid;
  const userEmail = req.user.email;

  if (!otp) {
    return res.status(400).json({ success: false, error: "A valid registration verification OTP is required." });
  }

  const targetRecord = otpCache.get(userEmail);

  if (!targetRecord) {
    return res.status(400).json({ success: false, error: "No OTP records requested or found. Please request a new code." });
  }

  if (Date.now() > targetRecord.expiresAt) {
    otpCache.delete(userEmail); 
    return res.status(400).json({ success: false, error: "The validation timeout expired. Please issue a new code." });
  }

  if (targetRecord.code !== otp) {
    return res.status(400).json({ success: false, error: "Incorrect verification code. Verify spelling and attempt retry." });
  }

  try {
    otpCache.delete(userEmail);

    const userProfile = {
      uid: userUid,
      email: userEmail,
      firstName: firstName || "",
      lastName: lastName || "",
      role: role || "candidate",
      createdAt: new Date().toISOString()
    };

    await db.collection("users").doc(userUid).set(userProfile);
    res.status(201).json({ success: true, message: "User profile synchronized successfully!" });
  } catch (error) {
    console.error("Profile synchronization error:", error);
    res.status(500).json({ success: false, error: "Database storage failure mapping user details." });
  }
});

module.exports = router;