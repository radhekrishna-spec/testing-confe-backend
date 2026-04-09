const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: true,
      index: true,
    },
    confessionNo: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    nickname: {
      type: String,
      default: '',
      trim: true,
    },

    extraFields: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    images: {
      type: [String],
      default: [],
    },

    caption: {
      type: String,
      default: '',
      trim: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'POSTING', 'POSTED', 'FAILED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },

    postedTime: {
      type: Date,
      default: null,
    },

    telegramMessageId: {
      type: String,
      default: null,
    },

    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Confession', confessionSchema);
