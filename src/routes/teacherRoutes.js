const express = require('express');
const Teacher = require('../models/Teacher');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const router = express.Router();
const { Parser } = require('json2csv');
const upload = multer({ dest: 'uploads/' });

// ✅ BULK UPLOAD TEACHERS
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    const teachers = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        teachers.push({
          name: row.name,
          post: row.post,
          email: row.email,
          phone: row.phone,
          collegeName: row.collegeName,
          subjects: row.subjects.split(',') // convert string → array
        });
      })
      .on('end', async () => {
        await Teacher.insertMany(teachers, { ordered: false });

        fs.unlinkSync(req.file.path); // delete CSV after upload

        res.status(201).json({
          message: "Teachers uploaded successfully",
          total: teachers.length
        });
      });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD TEACHER
router.post('/add', async (req, res) => {
  try {
    const { name, post, email, phone, subjects } = req.body;

    // Validation
    if (!name || !post || !email || !phone || !subjects) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const teacher = new Teacher({
      name,
      post,
      email,
      phone,
      subjects // must be array
    });

    await teacher.save();

    res.status(201).json({
      message: "Teacher added successfully",
      teacher
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET ALL TEACHERS
router.get('/all', async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ EXPORT TEACHERS TO CSV
router.get('/export-csv', async (req, res) => {
  try {
    const teachers = await Teacher.find().select('-__v');

    if (!teachers.length) {
      return res.status(404).json({ message: "No teachers found" });
    }

    // Fields to export
    const fields = [
      'name',
      'post',
      'email',
      'phone',
      'collegeName',
      'subjects',
      'createdAt'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(teachers);

    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=teachers.csv');

    res.send(csv);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
