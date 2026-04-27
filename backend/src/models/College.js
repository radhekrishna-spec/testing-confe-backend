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

    instagram: {
      accessToken: {
        type: String,
        default: '',
      },
      igUserId: {
        type: String,
        default: '',
      },
      pageName: {
        type: String,
        default: '',
      },
    },

    telegram: {
      botToken: {
        type: String,
        default: '',
      },
      chatId: {
        type: String,
        default: '',
      },
    },

    commandBot: {
      botToken: {
        type: String,
        default: '',
      },
      chatId: {
        type: String,
        default: '',
      },
    },

    payment: {
      razorpayLink: {
        type: String,
        default: '',
      },
      enabled: {
        type: Boolean,
        default: false,
      },
    },

    posting: {
      templateId: {
        type: String,
        default: '',
      },
      safeLimit: {
        type: Number,
        default: 665,
      },
    },

    drive: {
      rootFolderId: {
        type: String,
        default: '',
      },
      editArchiveFolderId: {
        type: String,
        default: '',
      },
      queueFolderId: {
        type: String,
        default: '',
      },
      postedFolderId: {
        type: String,
        default: '',
      },
      rejectedFolderId: {
        type: String,
        default: '',
      },
      smallConfessionFolder: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  },
);
collegeSchema.post('save', async function (doc) {
  try {
    if (doc?.drive?.rootFolderId) return;

 //   console.log(`📂 Auto creating folders for ${doc.name}`);

    // 🔥 dynamic require (fix circular dependency)
    const {
      setupCollegeFolders,
    } = require('../services/collegeAutoSetupService');

    await setupCollegeFolders(doc.collegeId, doc.name);

   // console.log(`✅ Auto setup done: ${doc.name}`);
  } catch (err) {
    console.error('❌ Auto Drive setup error:', err.message);
  }
});
module.exports = mongoose.model('College', collegeSchema);
