const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, password, collegeName, email, address, phoneNo } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    const admin = new Admin({
      username,
      password,
      collegeName,
      email,
      address,
      phoneNo
    });

    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    res.status(200).json({
      message: "Login successful",
      adminId: admin._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
