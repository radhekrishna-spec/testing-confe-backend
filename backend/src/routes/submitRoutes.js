const express = require('express');
const router = express.Router();

const identifyCollege = require('../middleware/identifyCollege');
const {
  submitConfession,
  postConfessionNow,
} = require('../../controllers/submitController');

// Debug middleware for submit route
router.post(
  '/submit',
  (req, res, next) => {
    console.log('🔥 SUBMIT ROUTE HIT');
    console.log('METHOD:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('QUERY:', req.query);
    console.log('BODY:', req.body);
    next();
  },
  identifyCollege,
  submitConfession,
);

// Debug middleware for instant post
router.post(
  '/post-now',
  (req, res, next) => {
    console.log('⚡ POST NOW ROUTE HIT');
    console.log('BODY:', req.body);
    next();
  },
  postConfessionNow,
);

module.exports = router;
