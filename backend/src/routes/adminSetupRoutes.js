const express = require('express');
const router = express.Router();

const { setupCollegeFolders } = require('../services/collegeAutoSetupService');

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

module.exports = router;
