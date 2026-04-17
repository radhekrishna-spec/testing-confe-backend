const express = require('express');
const router = express.Router();

const {
  setConfessionNo,
  getCurrentConfessionNo,
} = require('../modules/confession/services/confessionCounter');

const { getSettings, updateSettings } = require('../services/settingsService');

// ======================
// SETTINGS
// ======================
router.get('/settings', (req, res) => {
  try {
    const { collegeId } = req.query;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'collegeId required',
      });
    }

    const settings = getSettings(collegeId);

    res.json({
      success: true,
      ...settings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/settings', (req, res) => {
  try {
    const { collegeId, ...rest } = req.body;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'collegeId required',
      });
    }

    const updated = updateSettings(collegeId, rest);

    res.json({
      success: true,
      settings: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// CONFESSION NO
// ======================
router.get('/confession-no', async (req, res) => {
  try {
    const { collegeId } = req.query;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'collegeId required',
      });
    }

    const current = await getCurrentConfessionNo(collegeId);

    res.json({
      success: true,
      confessionNo: current,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/confession-no', async (req, res) => {
  try {
    const { confessionNo, collegeId } = req.body;

    if (!confessionNo || !collegeId) {
      return res.status(400).json({
        success: false,
        message: 'confessionNo and collegeId required',
      });
    }

    const updated = await setConfessionNo(collegeId, confessionNo);

    res.json({
      success: true,
      confessionNo: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
