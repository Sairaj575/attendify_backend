const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true
    },

    classId: {                         // ✅ ADD
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },

    subject: {
      type: String,
      required: true
    },

    subjectId: {                       // ✅ ADD
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    teacherName: {
      type: String,
      required: true
    },

    teacherId: {                       // ✅ ADD
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    totalStudents: {
      type: Number,
      required: true
    },

    lectureNo: {
      type: Number,
      required: true
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
