const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query, escape } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/requests/:id/messages', auth, (req, res) => {
  const { content } = req.body;
  const request_id = req.params.id;
  const sender_id = req.user.id;

  try {
    const id = uuidv4();
    query(`INSERT INTO messages (id, request_id, sender_id, content) VALUES ('${id}', '${escape(request_id)}', '${sender_id}', '${escape(content)}')`);
    
    const newMessage = query(`SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = '${id}'`)[0];
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get thread
router.get('/requests/:id/messages', auth, (req, res) => {
  try {
    const messages = query(`SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.request_id = '${escape(req.params.id)}' ORDER BY m.created_at ASC`);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
