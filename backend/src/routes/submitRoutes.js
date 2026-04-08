const express = require('express');
const router = express.Router();
const identifyCollege = require('../middleware/identifyCollege');
const {
  submitConfession,
  postConfessionNow,
} = require('../controllers/submitController');

router.post('/submit', identifyCollege, submitConfession);
router.post('/post-now', postConfessionNow);

module.exports = router;
