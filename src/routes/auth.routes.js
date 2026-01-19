const express = require("express");
const bcrypt = require("bcryptjs");
const Otp = require("../models/Otp");
const sendOtp = require("../utils/sendOtp");

const router = express.Router();

router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // Expiry (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Remove old OTPs
    await Otp.deleteMany({ phone });

    // Save OTP
    await Otp.create({ phone, otpHash, expiresAt });

    // Send SMS
    await sendOtp(phone, otp);

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const record = await Otp.findOne({ phone });

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.verified) {
      return res.status(400).json({ message: "OTP already used" });
    }

    // Check expiry
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Compare OTP
    const isValid = await bcrypt.compare(otp, record.otpHash);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark verified
    record.verified = true;
    await record.save();

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
