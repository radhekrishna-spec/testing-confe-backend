const mongoose = require('mongoose');

const aiTrainingConfessionSchema = new mongoose.Schema(
  {
    collegeCode: {
      type: String,
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    source: {
      type: String,
      enum: ['admin', 'telegram', 'legacy', 'user', 'ai'],
      default: 'admin',
    },

    isApprovedForTraining: {
      type: Boolean,
      default: true,
    },

    isRejected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  'AITrainingConfession',
  aiTrainingConfessionSchema,
);
