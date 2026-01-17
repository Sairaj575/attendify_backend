const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    sisId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, "Invalid mobile number"]
    },

    class: {
      type: String,
      required: true
    },

    year: {
      type: String,
      required: true
    },

      password: {
      type: String,
      required: true,
      default: () =>
        Math.random().toString(36).slice(-4) +
        Math.floor(1000 + Math.random() * 9000)
    },

    photo: {
      type: String, // image path or URL
      default: ""
    },

    branch: {
      type: String,
      required: true
    },

    collegeName: {
      type: String,
    },

    rollNo: {
      type: String,
      required: true,
      unique: true
    },

    enrollmentNo: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);


module.exports = mongoose.model('Student', studentSchema);
