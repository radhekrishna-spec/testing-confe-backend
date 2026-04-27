const express = require('express');
const router = express.Router();

const College = require('../models/College');
const {
  setupCollegeFolders,
} = require('../services/collegeAutoSetupService');

router.post('/setup-college', async (req, res) => {
  try {
    const { collegeId, name } = req.body;

    const result = await setupCollegeFolders(collegeId, name);

    res.json(result);
  } catch (error) {
    console.error('AUTO SETUP ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/setup-all-colleges', async (req, res) => {
  try {
    const colleges = await College.find({
      isActive: true,
    });

    const results = [];

    for (const college of colleges) {
      const result = await setupCollegeFolders(college.collegeId, college.name);

      results.push({
        collegeId: college.collegeId,
        success: true,
      });
    }

    res.json({
      success: true,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error('BULK SETUP ERROR:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
