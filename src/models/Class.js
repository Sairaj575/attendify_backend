const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    className: {
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
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);
