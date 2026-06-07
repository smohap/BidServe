const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Available requests for providers
router.get('/feed', auth, (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ message: 'Only providers can access the feed' });
  }

  try {
    const requests = query("SELECT * FROM service_requests WHERE status = 'open' ORDER BY created_at DESC");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
