const mongoose = require('mongoose');

const lecturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: 'lecturer', // Default role for lecturers
      enum: ['lecturer'], // Restrict the possible values for this field
    },
    isVerified: {
        type: Boolean,
        default: false,
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lecturer', lecturerSchema);