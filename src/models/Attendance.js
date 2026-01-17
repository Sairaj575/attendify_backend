const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    date: {
      type: Date,
      required: true,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      default: "Present"
    },

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
