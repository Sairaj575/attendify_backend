const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const Class = require('../models/Class');
const Student = require('../models/Student');

const router = express.Router();

// Multer config
const upload = multer({ dest: 'uploads/csv/' });

// ✅ CREATE CLASS + TEACHERS + STUDENTS
router.post('/import-class', upload.single('file'), async (req, res) => {
  try {
    const { className, year, teachers } = req.body;

    if (!className || !year || !teachers || !req.file) {
      return res.status(400).json({
        message: "className, year, teachers and CSV file are required"
      });
    }

    // Parse teachers JSON
    let teacherList;
    try {
      teacherList = JSON.parse(teachers);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid teachers JSON format"
      });
    }

    // Check class already exists
    const exists = await Class.findOne({ className, year });
    if (exists) {
      return res.status(400).json({
        message: "Class already exists"
      });
    }

    const studentIds = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', async (row) => {
        const student = await Student.findOne({
          sisId: row.sisId
        });

        if (student) {
          studentIds.push(student._id);
        }
      })
      .on('end', async () => {
        const newClass = new Class({
          className,
          year,
          teachers: teacherList,
          students: studentIds
        });

        await newClass.save();
        fs.unlinkSync(req.file.path);

        res.status(201).json({
          message: "Class created successfully",
          className,
          year,
          totalStudents: studentIds.length,
          teachers: teacherList.length
        });
      });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
