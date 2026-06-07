const express = require('express');
const { query, escape } = require('../db');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Accept/Reject/Counter an offer
router.put('/:id', auth, (req, res) => {
  const { status, price, message } = req.body;
  
  try {
    const offers = query(`SELECT * FROM offers WHERE id = '${escape(req.params.id)}'`);
    if (offers.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const offer = offers[0];
    const requests = query(`SELECT * FROM service_requests WHERE id = '${offer.request_id}'`);
    if (requests.length === 0) {
        return res.status(404).json({ message: 'Request associated with offer not found' });
    }
    const request = requests[0];

    // Only consumer can accept/reject
    if (status === 'accepted' || status === 'rejected') {
      if (request.consumer_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      query(`UPDATE offers SET status = '${escape(status)}' WHERE id = '${escape(req.params.id)}'`);
      
      if (status === 'accepted') {
        // Create transaction
        const transactionId = uuidv4();
        query(`INSERT INTO transactions (id, request_id, offer_id, agreed_price, consumer_id, provider_id) VALUES ('${transactionId}', '${request.id}', '${offer.id}', ${offer.price}, '${request.consumer_id}', '${offer.provider_id}')`);
        
        // Update request status
        query(`UPDATE service_requests SET status = 'accepted' WHERE id = '${request.id}'`);
        
        // Reject all other offers
        query(`UPDATE offers SET status = 'rejected' WHERE request_id = '${request.id}' AND id != '${offer.id}'`);
      }
    } else if (status === 'countered') {
      // Both parties can technically counter-offer, but let's assume standard flow
      query(`UPDATE offers SET price = ${price}, message = '${escape(message)}', status = 'countered' WHERE id = '${escape(req.params.id)}'`);
    }

    const updatedOffer = query(`SELECT * FROM offers WHERE id = '${escape(req.params.id)}'`)[0];
    res.json(updatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
