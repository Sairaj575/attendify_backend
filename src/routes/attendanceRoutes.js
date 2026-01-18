const express = require('express');
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Student = require('../models/Student');

const router = express.Router();

// ✅ ATTENDANCE SUMMARY
router.get('/summary/:sessionId', async (req, res) => {
    try {
    const { sessionId } = req.params;

    // 1️⃣ Get session
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // 2️⃣ Get all students of class
    const students = await Student.find({
      class: session.className
    }).select('rollNo name');

    // 3️⃣ Get attendance records
    const attendanceRecords = await Attendance.find({
      classId: session.classId,
      date: {
        $gte: new Date(session.date.setHours(0, 0, 0, 0)),
        $lte: new Date(session.date.setHours(23, 59, 59, 999))
      }
    });

    // 4️⃣ Map attendance
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId.toString()] = record.status;
    });

    // 5️⃣ Build final list
    const studentsList = students.map(student => ({
      rollNo: student.rollNo,
      name: student.name,
      status: attendanceMap[student._id.toString()] || "Absent"
    }));

    const totalStudents = studentsList.length;
    const presentStudents = studentsList.filter(
      s => s.status === "Present"
    ).length;

    const absentStudents = totalStudents - presentStudents;

    // ✅ RESPONSE
    res.status(200).json({
      className: session.className,
      subject: session.subject,
      lectureNo: session.lectureNo,
      totalStudents,
      presentStudents,
      absentStudents,
      students: studentsList
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ ATTENDANCE HISTORY
router.get('/history/:teacherName', async (req, res) => {
  try {
    const { teacherName } = req.params;

    // 1️⃣ Get all sessions of teacher
    const sessions = await Session.find({ teacherName }).sort({ date: -1 });

    if (!sessions.length) {
      return res.status(404).json({ message: "No attendance history found" });
    }

    const history = [];

    for (const session of sessions) {
      // 2️⃣ Count present students
      const presentCount = await Attendance.countDocuments({
        classId: session.classId,
        subjectId: session.subjectId,
        date: {
          $gte: new Date(session.date.setHours(0, 0, 0, 0)),
          $lte: new Date(session.date.setHours(23, 59, 59, 999))
        },
        status: "Present"
      });

      const total = session.totalStudents;
      const percentage = ((presentCount / total) * 100).toFixed(2);

      history.push({
        date: session.date.toISOString().split("T")[0],
        className: session.className,
        subject: session.subject,
        lectureNo: session.lectureNo,
        present: presentCount,
        total,
        percentage: `${percentage}%`
      });
    }

    res.status(200).json(history);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
