const mongoose = require("mongoose");

<<<<<<< HEAD
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false }
}, { timestamps: true });
=======
const otpSchema = new mongoose.Schema(
  {
    teacherName: { type: String, required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);
>>>>>>> 3c7e23ac363daf5710eed7dc3fc2c06b85d6cda0

module.exports = mongoose.model("Otp", otpSchema);
