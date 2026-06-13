const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const { query, escape } = require('../db');

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { idToken, role, roles } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'idToken is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google token does not contain email' });
    }

    const finalRoles = roles || (role ? [role] : ['consumer']);
    const rolesStr = finalRoles.join(',');
    const primaryRole = finalRoles[0];

    let users = query(`SELECT * FROM users WHERE email = '${escape(email)}'`);
    let user;

    if (users.length === 0) {
      const id = uuidv4();
      const password_hash = 'social_login_' + uuidv4();
      query(`INSERT INTO users (id, name, email, password_hash, role, roles) VALUES ('${id}', '${escape(name)}', '${escape(email)}', '${password_hash}', '${escape(primaryRole)}', '${escape(rolesStr)}')`);
      user = { id, name, email, role: primaryRole, roles: rolesStr };
    } else {
      user = users[0];
    }

    const rolesArr = user.roles ? user.roles.split(',') : [user.role];
    const token = jwt.sign({ id: user.id, role: user.role, roles: rolesArr }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, roles: rolesArr } });

  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({ message: 'Invalid Google token', error: error.message });
  }
});

// POST /api/auth/facebook
router.post('/facebook', async (req, res) => {
  const { accessToken, role, roles } = req.body;

  if (!accessToken) {
    return res.status(400).json({ message: 'accessToken is required' });
  }

  try {
    let email, name;

    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
      const debugRes = await axios.get('https://graph.facebook.com/debug_token', {
        params: {
          input_token: accessToken,
          access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`
        }
      });

      if (!debugRes.data.data.is_valid) {
        return res.status(401).json({ message: 'Invalid Facebook token' });
      }

      const meRes = await axios.get('https://graph.facebook.com/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name,email'
        }
      });
      email = meRes.data.email;
      name = meRes.data.name;
    } else {
      const meRes = await axios.get('https://graph.facebook.com/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name,email'
        }
      });
      email = meRes.data.email;
      name = meRes.data.name;
    }

    if (!email) {
      return res.status(400).json({ message: 'Facebook account does not have an email or permission not granted' });
    }

    const finalRoles = roles || (role ? [role] : ['consumer']);
    const rolesStr = finalRoles.join(',');
    const primaryRole = finalRoles[0];

    let users = query(`SELECT * FROM users WHERE email = '${escape(email)}'`);
    let user;

    if (users.length === 0) {
      const id = uuidv4();
      const password_hash = 'social_login_' + uuidv4();
      query(`INSERT INTO users (id, name, email, password_hash, role, roles) VALUES ('${id}', '${escape(name)}', '${escape(email)}', '${password_hash}', '${escape(primaryRole)}', '${escape(rolesStr)}')`);
      user = { id, name, email, role: primaryRole, roles: rolesStr };
    } else {
      user = users[0];
    }

    const rolesArr = user.roles ? user.roles.split(',') : [user.role];
    const token = jwt.sign({ id: user.id, role: user.role, roles: rolesArr }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, roles: rolesArr } });

  } catch (error) {
    console.error('Facebook Auth Error:', error.response ? error.response.data : error.message);
    res.status(401).json({ message: 'Invalid Facebook token', error: error.message });
  }
});

module.exports = router;
