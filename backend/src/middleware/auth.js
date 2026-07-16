const jwt = require('jsonwebtoken');
const env = require('../config/env');

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Token no provisto' });
  }
  try {
    req.admin = jwt.verify(token, env.jwtSecret);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

module.exports = { requireAdmin };
