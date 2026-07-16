const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { getSystemTime, setSystemTime, resetSystemTime } = require('../services/systemTimeService');

const router = express.Router();

router.get('/time', (req, res) => {
  res.json({ systemTime: getSystemTime() });
});

router.post('/time', requireAdmin, (req, res, next) => {
  try {
    const { datetime } = req.body;
    if (!datetime) {
      return res.status(400).json({ error: 'datetime es requerido' });
    }
    const systemTime = setSystemTime(datetime);
    res.json({ systemTime });
  } catch (err) {
    next(err);
  }
});

router.post('/time/reset', requireAdmin, (req, res) => {
  resetSystemTime();
  res.json({ systemTime: getSystemTime() });
});

module.exports = router;
