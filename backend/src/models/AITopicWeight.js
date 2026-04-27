const mongoose = require('mongoose');

const AITopicWeightSchema = new mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('AITopicWeight', AITopicWeightSchema);
