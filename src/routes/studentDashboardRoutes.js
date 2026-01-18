const express = require('express');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Class = require('../models/Class');

const router = express.Router();

// ✅ STUDENT DASHBOARD
router.get('/dashboard/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1️⃣ Student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Date & Time
    const now = new Date();
    const todayDate = now.toLocaleDateString();
    const todayDay = now.toLocaleString('en-IN', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString();

    // 3️⃣ Fetch class schedule
    const classData = await Class.findOne({
      className: student.class
    });

    const todayClasses = classData
      ? classData.teachers.map(t => ({
          subject: t.subject,
          time: t.time || "Not Scheduled"
        }))
      : [];

    // 4️⃣ Get student attendance records
    const attendanceRecords = await Attendance.find({
      studentId
    });

    // 5️⃣ Get sessions for student's class
    const sessions = await Session.find({
      className: student.class
    });

    // 6️⃣ Subject-wise attendance
    const subjectStats = {};

    sessions.forEach(session => {
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = {
          subject: session.subject,
          totalClasses: 0,
          present: 0
        };
      }
      subjectStats[session.subject].totalClasses += 1;
    });

    attendanceRecords.forEach(record => {
      if (record.status === "Present") {
        const session = sessions.find(
          s => s._id.toString() === record.sessionId?.toString()
        );

        if (session) {
          subjectStats[session.subject].present += 1;
        }
      }
    });

    const attendanceSummary = Object.values(subjectStats).map(s => ({
      subject: s.subject,
      totalClasses: s.totalClasses,
      present: s.present,
      percentage:
        s.totalClasses === 0
          ? "0%"
          : ((s.present / s.totalClasses) * 100).toFixed(2) + "%"
    }));

    // ✅ FINAL RESPONSE
    res.json({
      studentName: student.name,
      rollNo: student.rollNo,
      class: student.class,

      currentDate: todayDate,
      currentDay: todayDay,
      currentTime: currentTime,

      todayClasses,
      attendanceSummary
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ SUBJECT WISE ATTENDANCE
router.get('/subjects/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1️⃣ Get student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Get class data
    const classData = await Class.findOne({
      className: student.class
    });

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 3️⃣ Get all sessions for this class
    const sessions = await Session.find({
      className: student.class
    });

    // 4️⃣ Get attendance of this student
    const attendance = await Attendance.find({
      studentId
    });

    // 5️⃣ Build subject-wise report
    const subjectReport = {};

    classData.teachers.forEach(t => {
      subjectReport[t.subject] = {
        subject: t.subject,
        teacher: t.teacherName,
        totalLectures: 0,
        attended: 0
      };
    });

    sessions.forEach(session => {
      if (subjectReport[session.subject]) {
        subjectReport[session.subject].totalLectures++;
      }
    });

    attendance.forEach(record => {
      if (record.status === "Present") {
        const subject = sessions.find(
          s => s._id.toString() === record.sessionId?.toString()
        )?.subject;

        if (subject && subjectReport[subject]) {
          subjectReport[subject].attended++;
        }
      }
    });

    // 6️⃣ Final output
    const result = Object.values(subjectReport).map(sub => ({
      subject: sub.subject,
      teacher: sub.teacher,
      totalLectures: sub.totalLectures,
      attended: sub.attended,
      percentage:
        sub.totalLectures === 0
          ? "0%"
          : ((sub.attended / sub.totalLectures) * 100).toFixed(2) + "%"
    }));

    res.json({
      studentName: student.name,
      class: student.class,
      subjects: result
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
