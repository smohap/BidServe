const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query, escape } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all requests (optionally filtered by consumer_id)
router.get('/', auth, (req, res) => {
  try {
    let sql = 'SELECT * FROM service_requests';
    if (req.query.consumer_id) {
      sql += ` WHERE consumer_id = '${escape(req.query.consumer_id)}'`;
    }
    const requests = query(sql);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new request
router.post('/', auth, (req, res) => {
  const { title, description, budget, voice_note_url, latitude, longitude } = req.body;
  const consumer_id = req.user.id;

  try {
    const id = uuidv4();
    query(`INSERT INTO service_requests (id, consumer_id, title, description, budget, voice_note_url, latitude, longitude) VALUES ('${id}', '${consumer_id}', '${escape(title)}', '${escape(description)}', ${budget}, '${escape(voice_note_url)}', ${latitude || 'NULL'}, ${longitude || 'NULL'})`);
    
    const newRequest = query(`SELECT * FROM service_requests WHERE id = '${id}'`)[0];
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single request
router.get('/:id', auth, (req, res) => {
  try {
    const requests = query(`SELECT * FROM service_requests WHERE id = '${escape(req.params.id)}'`);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(requests[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a request
router.put('/:id', auth, (req, res) => {
  const { title, description, budget, status, latitude, longitude } = req.body;
  
  try {
    const requests = query(`SELECT * FROM service_requests WHERE id = '${escape(req.params.id)}'`);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (requests[0].consumer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let updateFields = [];
    if (title) updateFields.push(`title = '${escape(title)}'`);
    if (description) updateFields.push(`description = '${escape(description)}'`);
    if (budget) updateFields.push(`budget = ${budget}`);
    if (status) updateFields.push(`status = '${escape(status)}'`);
    if (latitude) updateFields.push(`latitude = ${latitude}`);
    if (longitude) updateFields.push(`longitude = ${longitude}`);
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    query(`UPDATE service_requests SET ${updateFields.join(', ')} WHERE id = '${escape(req.params.id)}'`);
    
    const updatedRequest = query(`SELECT * FROM service_requests WHERE id = '${escape(req.params.id)}'`)[0];
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Offer routes moved here ---

// Provider makes an offer
router.post('/:id/offers', auth, (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ message: 'Only providers can make offers' });
  }

  const { price, message } = req.body;
  const request_id = req.params.id;
  const provider_id = req.user.id;

  try {
    const id = uuidv4();
    query(`INSERT INTO offers (id, request_id, provider_id, price, message) VALUES ('${id}', '${escape(request_id)}', '${provider_id}', ${price}, '${escape(message)}')`);
    
    // Update request status to negotiating
    query(`UPDATE service_requests SET status = 'negotiating' WHERE id = '${escape(request_id)}'`);

    const newOffer = query(`SELECT * FROM offers WHERE id = '${id}'`)[0];
    res.status(201).json(newOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List offers for a request
router.get('/:id/offers', auth, (req, res) => {
  try {
    const offers = query(`SELECT o.*, u.name as provider_name FROM offers o JOIN users u ON o.provider_id = u.id WHERE o.request_id = '${escape(req.params.id)}'`);
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Message routes moved here ---

// Send message
router.post('/:id/messages', auth, (req, res) => {
  const { content, text } = req.body;
  const messageContent = content || text;
  const request_id = req.params.id;
  const sender_id = req.user.id;

  try {
    const id = uuidv4();
    query(`INSERT INTO messages (id, request_id, sender_id, content) VALUES ('${id}', '${escape(request_id)}', '${sender_id}', '${escape(messageContent)}')`);
    
    const newMessage = query(`SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = '${id}'`)[0];
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get thread
router.get('/:id/messages', auth, (req, res) => {
  try {
    const messages = query(`SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.request_id = '${escape(req.params.id)}' ORDER BY m.created_at ASC`);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
