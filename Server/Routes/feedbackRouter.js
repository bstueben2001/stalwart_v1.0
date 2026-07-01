const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch(`https://formspree.io/f/${process.env.FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim() }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Formspree rejected the request');
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Feedback email error:', err);
    res.status(500).json({ error: 'Failed to send feedback' });
  }
});

module.exports = router;
