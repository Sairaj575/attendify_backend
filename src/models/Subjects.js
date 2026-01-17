const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    subjectId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    subjectName: {
      type: String,
      required: true,
      trim: true
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },

    branch: {
      type: String,
      required: true
    },

    semester: {
      type: String,
      required: true
    },

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Subject", subjectSchema);
