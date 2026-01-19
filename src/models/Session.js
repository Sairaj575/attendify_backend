const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },

    subject: {
      type: String,
      required: true
    },

    teacherName: {
      type: String,
      required: true
    },

    teacherId: {
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
