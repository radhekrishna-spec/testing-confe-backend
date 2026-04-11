const mongoose = require('mongoose');

const AIFeedbackSchema = new mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: true,
      index: true,
    },
    confessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Confession',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    feedback: {
      type: String,
      enum: ['APPROVED', 'REJECTED'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('AIFeedback', AIFeedbackSchema);
