const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
      default: () => {
        return (
          Math.random().toString(36).slice(-4) +
          Math.floor(1000 + Math.random() * 9000)
        );
      }
    },

    name: {
      type: String,
      required: true
    },

    post: {
      type: String,
      required: true
    },

    subjectIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
      }
    ],

    classIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
      }
    ],

    email: {
      type: String,
      required: true,
      unique: true
    },

    collegeName: String,

    phone: {
      type: String,
      required: true
    },

    photo: {
      type: String,
      default: ""
    },

    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College"
    },

    subjects: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
