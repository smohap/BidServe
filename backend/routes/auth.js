const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, escape } = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, phone, role, latitude, longitude } = req.body;

  try {
    const existingUser = query(`SELECT * FROM users WHERE email = '${escape(email)}'`);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const id = uuidv4();

    query(`INSERT INTO users (id, name, email, password_hash, phone, role, latitude, longitude) VALUES ('${id}', '${escape(name)}', '${escape(email)}', '${password_hash}', '${escape(phone)}', '${escape(role)}', ${latitude || 'NULL'}, ${longitude || 'NULL'})`);

    const token = jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

    res.status(201).json({ token, user: { id, name, email, phone, role, latitude, longitude } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = query(`SELECT * FROM users WHERE email = '${escape(email)}'`);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
