require('dotenv').config();
const path = require('path');
const Confession = require('../models/Confession');

require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
});
const express = require('express');
const Razorpay = require('razorpay');

const router = express.Router();

const { FRONTEND_URL } = require('../config');

const successUrl = `${FRONTEND_URL}/success`;

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
      callback_url: successUrl,
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
router.post('/create-order', async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 200,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Order failed' });
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
