const express = require('express');
const router = express.Router();
const formService = require('../services/formService');

router.post('/submit', async (req, res) => {
  try {
    const { text } = req.body;

    const result = await formService.handleSubmit(text);

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
