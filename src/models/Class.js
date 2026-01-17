const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    classId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    className: {
      type: String,
      required: true,
      trim: true
    },

    subject: [
      {
        type: String,
        ref: "Subject"
      }
    ],

    attendance: {
      type: Boolean,
      default: false
    },

    teacherIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
      }
    ],

    branch: {
      type: String,
      required: true
    },

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Class", classSchema);
