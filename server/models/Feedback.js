const moongose = require("mongoose");

const feedbackSchema = new moongose.Schema({
  category: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = moongose.model("Feedback", feedbackSchema);
