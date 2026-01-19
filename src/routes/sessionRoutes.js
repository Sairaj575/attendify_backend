const express = require('express');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Session = require('../models/Session');
const QRCode = require('qrcode');

const router = express.Router();

// ✅ GET SESSION DATA FOR LOGGED-IN TEACHER
router.get('/details/:teacherName', async (req, res) => {
  try {
    const { teacherName } = req.params;

    // 1️⃣ Find class
    const classData = await Class.findOne({
      "teachers.teacherName": teacherName
    });

    if (!classData) {
      return res.status(404).json({
        message: "No class found for this teacher"
      });
    }

    // 2️⃣ Get teacher subject
    const teacherData = classData.teachers.find(
      t => t.teacherName === teacherName
    );

    if (!teacherData) {
      return res.status(404).json({
        message: "Teacher not found in class"
      });
    }

    const subject = teacherData.subject;

    // 3️⃣ Count students
    const totalStudents = await Student.countDocuments({
      class: classData.className
    });

    // 4️⃣ Get next lecture number
    const lastSession = await Session.findOne({
      className: classData.className,
      subject
    }).sort({ lectureNo: -1 });

    const lectureNo = lastSession ? lastSession.lectureNo + 1 : 1;

    // ✅ 5️⃣ CREATE SESSION
    const newSession = await Session.create({
      className: classData.className,
      classId: classData._id,
      subject,
      teacherName,
      teacherId: teacherData._id || null,
      totalStudents,
      lectureNo
    });

    // ✅ FINAL RESPONSE
    res.status(200).json({
      sessionId: newSession._id,
      className: classData.className,
      subject,
      teacherName,
      totalStudents,
      lectureNo
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// ✅ GENERATE QR + CODE FOR ATTENDANCE
router.get('/generate-qr/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 1️⃣ Get session from DB
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found"
      });
    }

    // 2️⃣ Generate 6-digit code
    const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3️⃣ Expiry time (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 4️⃣ QR payload
    const qrPayload = JSON.stringify({
      sessionId,
      sessionCode
    });

    // 5️⃣ Generate QR image
    const qrCode = await QRCode.toDataURL(qrPayload);

    // ✅ RESPONSE (NO DB CHANGE)
    res.status(200).json({
      sessionId,
      className: session.className,
      subject: session.subject,
      teacherName: session.teacherName,
      lectureNo: session.lectureNo,
      totalStudents: session.totalStudents,
      sessionCode,
      qrCode,
      expiresAt
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
