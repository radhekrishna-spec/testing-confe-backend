const express = require('express');
const router = express.Router();
const identifyCollege = require('../middleware/identifyCollege');

router.get('/college-info', identifyCollege, (req, res) => {
  res.json(req.college);
});

module.exports = router;
