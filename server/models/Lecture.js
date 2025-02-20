const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true },
    description: { type: String },
    level: { type: String, required: true }, // Can remove the level lateron
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lecture", lectureSchema);
