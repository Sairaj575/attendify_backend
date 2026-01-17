const express = require('express');
const Class = require('../models/Class');

const router = express.Router();

// ✅ CREATE CLASS WITH MULTIPLE TEACHERS
router.post('/add', async (req, res) => {
  try {
    const { className, teachers } = req.body;

    if (!className || !teachers || teachers.length === 0) {
      return res.status(400).json({
        message: "Class name and teachers are required"
      });
    }

    const newClass = new Class({
      className,
      teachers
    });

    await newClass.save();

    res.status(201).json({
      message: "Class created successfully",
      class: newClass
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
