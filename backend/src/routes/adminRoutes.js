const express = require('express');
const router = express.Router();
const Confession = require('../models/Confession');
const identifyCollege = require('../middleware/identifyCollege');
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

router.get('/colleges', getAllColleges);

router.get('/confessions/:collegeId', getCollegeConfessions);

module.exports = router;
