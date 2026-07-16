const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const env = require('../config/env');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username y password son requeridos' });
    }

    const { rows } = await query('SELECT * FROM admin_users WHERE username = $1', [username]);
    const admin = rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const token = jwt.sign({ sub: admin.id, username: admin.username }, env.jwtSecret, {
      expiresIn: '12h',
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
