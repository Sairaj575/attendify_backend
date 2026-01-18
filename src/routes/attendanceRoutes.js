const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const router = express.Router();

// ✅ GET ATTENDANCE SUMMARY
router.get('/summary', async (req, res) => {
  try {
    const { classId, subjectId, date } = req.query;

    if (!classId || !subjectId || !date) {
      return res.status(400).json({
        message: "classId, subjectId and date are required"
      });
    }

    // 1️⃣ Get all students of class
    const students = await Student.find({ class: classId })
      .select('name rollNo');

    // 2️⃣ Get attendance records for this session
    const attendanceRecords = await Attendance.find({
      classId,
      subjectId,
      date: {
        $gte: new Date(date + "T00:00:00.000Z"),
        $lte: new Date(date + "T23:59:59.999Z")
      }
    });

    // 3️⃣ Map attendance
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId.toString()] = record.status;
    });

    // 4️⃣ Prepare final list
    const studentsList = students.map(student => ({
      rollNo: student.rollNo,
      name: student.name,
      status: attendanceMap[student._id.toString()] || "Absent"
    }));

    const totalStudents = students.length;
    const presentStudents = studentsList.filter(
      s => s.status === "Present"
    ).length;

    const absentStudents = totalStudents - presentStudents;

    res.status(200).json({
      totalStudents,
      presentStudents,
      absentStudents,
      students: studentsList
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
