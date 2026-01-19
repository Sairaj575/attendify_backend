const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const Class = require('../models/Class');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const router = express.Router();

// Multer config
const upload = multer({ dest: 'uploads/csv/' });


// ✅ CREATE CLASS + STUDENTS + AUTO ASSIGN TO TEACHERS
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

    // Check if class already exists
    const exists = await Class.findOne({ className, year });
    if (exists) {
      return res.status(400).json({
        message: "Class already exists"
      });
    }

    const rows = [];

    // Read CSV
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', async () => {
        try {
          const studentIds = [];

          // Fetch students from DB
          for (const row of rows) {
            const student = await Student.findOne({
              sisId: row.sisId
            });

            if (student) {
              studentIds.push(student._id);
            }
          }

          // Create class
          const newClass = new Class({
            className,
            year,
            teachers: teacherList,
            students: studentIds
          });

          await newClass.save();

          // ✅ AUTO ASSIGN CLASS TO TEACHERS
          for (const t of teacherList) {
            await Teacher.updateOne(
              { name: t.teacherName },
              { $addToSet: { classIds: newClass._id } }
            );
          }

          fs.unlinkSync(req.file.path);

          res.status(201).json({
            message: "Class created and assigned to teachers successfully",
            className,
            year,
            totalStudents: studentIds.length,
            teachersAssigned: teacherList.length
          });

        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET STUDENTS OF A CLASS
router.get('/students/:classId', async (req, res) => {
  try {
    const { classId } = req.params;

    // 1️⃣ Find class and populate students
    const classData = await Class.findById(classId)
      .populate('students');

    if (!classData) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    res.status(200).json({
      className: classData.className,
      year: classData.year,
      totalStudents: classData.students.length,
      students: classData.students
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


module.exports = router;
