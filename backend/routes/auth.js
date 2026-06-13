const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, escape } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, phone, role, roles, latitude, longitude } = req.body;

  try {
    const existingUser = query(`SELECT * FROM users WHERE email = '${escape(email)}'`);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const id = uuidv4();

    // Support both roles array and single role string for backwards compatibility
    const finalRoles = roles || (role ? [role] : ['consumer']);
    const rolesStr = finalRoles.join(',');
    const primaryRole = finalRoles[0];

    query(`INSERT INTO users (id, name, email, password_hash, phone, role, roles, latitude, longitude) VALUES ('${id}', '${escape(name)}', '${escape(email)}', '${password_hash}', '${escape(phone)}', '${escape(primaryRole)}', '${escape(rolesStr)}', ${latitude || 'NULL'}, ${longitude || 'NULL'})`);

    const token = jwt.sign({ id, role: primaryRole, roles: finalRoles }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

    res.status(201).json({ token, user: { id, name, email, phone, role: primaryRole, roles: finalRoles, latitude, longitude } });
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

    const rolesArr = user.roles ? user.roles.split(',') : [user.role];
    const token = jwt.sign({ id: user.id, role: user.role, roles: rolesArr }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, roles: rolesArr } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile (roles, etc.)
router.put('/profile', auth, async (req, res) => {
  const { name, phone, roles, latitude, longitude } = req.body;
  const userId = req.user.id;

  try {
    let updateFields = [];
    if (name) updateFields.push(`name = '${escape(name)}'`);
    if (phone) updateFields.push(`phone = '${escape(phone)}'`);
    if (roles && Array.isArray(roles)) {
      const rolesStr = roles.join(',');
      updateFields.push(`roles = '${escape(rolesStr)}'`);
      if (roles.length > 0) {
        updateFields.push(`role = '${escape(roles[0])}'`);
      }
    }
    if (latitude !== undefined) updateFields.push(`latitude = ${latitude || 'NULL'}`);
    if (longitude !== undefined) updateFields.push(`longitude = ${longitude || 'NULL'}`);

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = '${userId}'`);

    const updatedUsers = query(`SELECT * FROM users WHERE id = '${userId}'`);
    const user = updatedUsers[0];
    const rolesArr = user.roles ? user.roles.split(',') : [user.role];

    res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, roles: rolesArr, latitude: user.latitude, longitude: user.longitude } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
