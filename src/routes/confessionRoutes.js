const express = require('express');
const router = express.Router();
const Confession = require('../models/Confession');
const {
  handleSubmit,
  processFormSubmit,
} = require('../services/formSubmitService');

router.post('/submit', async (req, res) => {
  try {
    const { message } = req.body;

    const newConfession = new Confession({
      message,
    });

    console.log('STEP 1 request received');

    await newConfession.save();
    console.log('STEP 2 mongo saved');

    const result = await processFormSubmit({
      confession: message,
    });
    console.log('STEP 3 process done');

    const queueAhead = await Confession.countDocuments({
      status: 'pending',
    });

    const estimatedMinutes = queueAhead * 15;
    const eta = new Date(Date.now() + estimatedMinutes * 60000);

    res.status(201).json({
      success: true,
      confessionNo: result.confessionNo,
      queueAhead: 7,
      estimatedPostTime: 'Today 8:30 PM',
      data: newConfession,
    });
  } catch (error) {
    console.error('ROUTE ERROR:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
