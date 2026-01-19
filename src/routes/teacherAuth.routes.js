const express = require("express");
const bcrypt = require("bcryptjs");
const Teacher = require("../models/Teacher");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const sendOtp = require("../utils/sendOtp");
const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // 1. Find teacher
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3. Create JWT
    const token = jwt.sign(
      {
        teacherId: teacher._id,
        email: teacher.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    // 4. Send response
    res.json({
      message: "Login successful",
      token,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        post: teacher.post,
        phone: teacher.phone,
        subjects: teacher.subjects,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/logout", (req, res) => {
  res.json({
    message: "Logout successful. Please remove token on client side.",
  });
});

router.post("/send-otp", async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "name and phone required" });
    }

    const teacher = await Teacher.findOne({ name, phone });
    if (!teacher) {
      return res.status(400).json({ error: "Teacher not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ teacherName: name });

    await Otp.create({
      teacherName: name,
      otpHash,
      expiresAt,
    });

    await sendOtp(phone, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { name, otp } = req.body;

    const record = await Otp.findOne({ teacherName: name });

    if (!record) {
      return res.status(400).json({ error: "OTP not found" });
    }

    if (record.verified) {
      return res.status(400).json({ error: "OTP already used" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    record.verified = true;
    await record.save();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/change-password", async (req, res) => {
  try {
    const { name, phone, newPassword } = req.body;

    if (!name || !phone || !newPassword) {
      return res.status(400).json({ error: "Missing data" });
    }

    const otpRecord = await Otp.findOne({
      teacherName: name,
      verified: true,
    });

    if (!otpRecord) {
      return res.status(403).json({ error: "OTP verification required" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const teacher = await Teacher.findOneAndUpdate(
      { name, phone },
      { password: hashedPassword },
    );

    if (!teacher) {
      return res.status(400).json({ error: "Teacher not found" });
    }

    // cleanup OTP
    await Otp.deleteMany({ teacherName: name });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
