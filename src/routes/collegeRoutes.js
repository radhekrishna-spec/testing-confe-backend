const express = require('express');
const router = express.Router();
const College = require('../models/College');

router.get('/college-info', async (req, res) => {
  try {
    const { collegeId } = req.query;

    const college = await College.findOne({
      collegeId: collegeId || 'miet',
    });

    res.json(college);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
