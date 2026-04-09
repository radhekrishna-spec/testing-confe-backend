const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    domain: {
      type: String,
      default: '',
      trim: true,
    },

    subdomain: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },

    logo: {
      type: String,
      default: '',
    },

    themeColor: {
      type: String,
      default: '#000000',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('College', collegeSchema);
