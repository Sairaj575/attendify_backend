const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true
    },

    year: {
      type: String,
      required: true
    },

    teachers: [
      {
        teacherName: {
          type: String,
          required: true
        },
        subject: {
          type: String,
          required: true
        }
      }
    ],

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Class', classSchema);
