const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'breaddev.survey@gmail.com',
      subject: 'Stalwart App — User Feedback',
      text: message.trim(),
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Feedback email error:', err);
    res.status(500).json({ error: 'Failed to send feedback' });
  }
});

module.exports = router;
