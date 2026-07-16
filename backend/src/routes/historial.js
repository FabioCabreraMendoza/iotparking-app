const express = require('express');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { placa } = req.query;
    const { rows } = placa
      ? await query(
          'SELECT * FROM historial_accesos WHERE placa_auto ILIKE $1 ORDER BY "timestamp" DESC',
          [`%${placa}%`]
        )
      : await query('SELECT * FROM historial_accesos ORDER BY "timestamp" DESC LIMIT 200');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
