const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    collegeCode: {
      type: String,
      required: true,
      index: true,
    },

    confessionNo: {
      type: Number,
      required: true,
    },

    source: {
      type: String,
      enum: ['user', 'ai'],
      default: 'user',
    },

    reason: {
      type: String,
      default: 'manual_reject',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('AIRejectionLog', schema);
