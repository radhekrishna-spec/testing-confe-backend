const express = require('express');
const router = express.Router();
const Confession = require('../models/Confession');
const identifyCollege = require('../middleware/identifyCollege');
const College = require('../models/College');
const {
  broadcastConfession,
  getAllColleges,
  getCollegeConfessions,
} = require('../controllers/adminController');

router.get('/confessions', identifyCollege, async (req, res) => {
  try {
    const data = await Confession.find({
      collegeId: req.college.collegeId,
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
router.post('/broadcast', broadcastConfession);

router.get('/colleges', (req, res) => {
 // console.log('🔥 /api/admin/colleges HIT');
  getAllColleges(req, res);
});
router.get('/college/:collegeId', async (req, res) => {
  try {
    const college = await College.findOne({
      collegeId: req.params.collegeId,
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    res.json({
      success: true,
      data: college,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.patch('/college/:collegeId/payment', async (req, res) => {
  try {
    const { enabled } = req.body;

    const updatedCollege = await College.findOneAndUpdate(
      { collegeId: req.params.collegeId },
      {
        $set: {
          'payment.enabled': enabled,
        },
      },
      {
        new: true,
      },
    );

    if (!updatedCollege) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    res.json({
      success: true,
      data: updatedCollege,
    });
  } catch (error) {
    console.error('PAYMENT TOGGLE ERROR:', error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/confessions/:collegeId', getCollegeConfessions);

router.get('/ai-training/count/:collegeCode', async (req, res) => {
  try {
    const AITrainingConfession = require('../models/AITrainingConfession');

    const { collegeCode } = req.params;

    const count = await AITrainingConfession.countDocuments({
      collegeCode,
      isApprovedForTraining: true,
      isRejected: false,
    });

    return res.json({
      success: true,
      count,
      readyForAI: count >= 100,
    });
  } catch (error) {
    console.error('AI COUNT ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

router.get('/ai-training/list/:collegeCode', async (req, res) => {
  try {
    const AITrainingConfession = require('../models/AITrainingConfession');

    const { collegeCode } = req.params;

    const items = await AITrainingConfession.find({
      collegeCode,
      isRejected: false,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error('AI LIST ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});
router.delete('/ai-training/delete/:id', async (req, res) => {
  try {
    const AITrainingConfession = require('../models/AITrainingConfession');

    await AITrainingConfession.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Deleted ✅',
    });
  } catch (error) {
    console.error('AI DELETE ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});
router.post('/college/create', async (req, res) => {
  try {
    const College = require('../models/College');

    const college = await College.create(req.body);

    res.status(201).json({
      success: true,
      data: college,
    });
  } catch (error) {
    console.error('CREATE COLLEGE ERROR:', error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.patch('/college/:collegeId/update', async (req, res) => {
  try {
    const updated = await College.findOneAndUpdate(
      { collegeId: req.params.collegeId },
      { $set: req.body },
      { new: true },
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
router.get('/ai-training/stats/:collegeCode', async (req, res) => {
  try {
    const AITrainingConfession = require('../models/AITrainingConfession');

    const { collegeCode } = req.params;

    const stats = await AITrainingConfession.aggregate([
      {
        $match: {
          collegeCode,
          isRejected: false,
        },
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
    ]);

    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('AI STATS ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});
router.post('/ai-training/import-legacy/:collegeCode', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const AITrainingConfession = require('../models/AITrainingConfession');

    const { collegeCode } = req.params;
    const limit = Number(req.body.limit) || 100;

    let legacyCollectionName = '';

    if (collegeCode === 'miet') {
      legacyCollectionName = 'legacy_confessions_miet';
    } else if (collegeCode === 'niet') {
      legacyCollectionName = 'legacy_confessions_niet';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Legacy collection not found',
      });
    }

    const db = mongoose.connection.db;

    const legacyItems = await db
      .collection(legacyCollectionName)
      .find({})
      .limit(limit)
      .toArray();

    let inserted = 0;
    let skipped = 0;

    for (const item of legacyItems) {
      const text = item.message || item.text;

      if (!text) continue;

      const exists = await AITrainingConfession.findOne({
        collegeCode,
        text,
      });

      if (exists) {
        skipped++;
        continue;
      }

      await AITrainingConfession.create({
        collegeCode,
        text,
        source: 'legacy',
        isApprovedForTraining: true,
        isRejected: false,
      });

      inserted++;
    }

    return res.json({
      success: true,
      inserted,
      skipped,
    });
  } catch (error) {
    console.error('LEGACY IMPORT ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});
router.patch('/ai-training/update/:id', async (req, res) => {
  try {
    const AITrainingConfession = require('../models/AITrainingConfession');

    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Text is required',
      });
    }

    const updated = await AITrainingConfession.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          text: text.trim(),
        },
      },
      {
        new: true,
      },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Training item not found',
      });
    }

    return res.json({
      success: true,
      data: updated,
      message: 'Updated successfully ✅',
    });
  } catch (error) {
    console.error('AI EDIT ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});
router.post('/ai-training/add', async (req, res) => {
  try {
    const AITrainingConfession = require('../models/AITrainingConfession');

    const { collegeCode, text, source } = req.body;

    if (!collegeCode || !text) {
      return res.status(400).json({
        success: false,
        message: 'collegeCode and text required',
      });
    }

    const alreadyExists = await AITrainingConfession.findOne({
      collegeCode,
      text,
    });

    if (alreadyExists) {
      return res.json({
        success: true,
        message: 'Already exists',
      });
    }

    const saved = await AITrainingConfession.create({
      collegeCode,
      text,
      source: source || 'admin',
      isApprovedForTraining: true,
      isRejected: false,
    });

    return res.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error('AI TRAINING SAVE ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
