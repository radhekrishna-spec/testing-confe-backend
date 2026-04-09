require('dotenv').config();
const path = require('path');
const Confession = require('../models/Confession');

require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
});
const express = require('express');
const Razorpay = require('razorpay');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-payment-link', async (req, res) => {
  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: 200, // ₹2
      currency: 'INR',
      accept_partial: false,
      description: 'Anonymous Confession Submission',
      customer: {
        name: 'Anonymous User',
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: false,
      callback_url: 'https://confession-wallah.vercel.app/success',
      callback_method: 'get',
    });

    res.json({
      success: true,
      short_url: paymentLink.short_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    const { confessionNo, paymentId } = req.body;

    await Confession.updateOne(
      { confessionNo: Number(confessionNo) },
      {
        isPaid: true,
        paymentId,
      },
    );

    res.json({
      success: true,
      message: 'Payment verified and updated',
    });
  } catch (error) {
    console.error('PAYMENT VERIFY ERROR:', error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
