const express = require('express');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const { getSystemTime } = require('../services/systemTimeService');

const router = express.Router();
router.use(requireAdmin);

const PERIODOS = { daily: 'day', weekly: 'week', monthly: 'month' };

function parseRange(req) {
  const hasta = req.query.hasta ? new Date(req.query.hasta) : getSystemTime();
  const desde = req.query.desde
    ? new Date(req.query.desde)
    : new Date(hasta.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { desde, hasta };
}

router.get('/resumen', async (req, res, next) => {
  try {
    const [{ rows: porEstado }, { rows: usuariosRows }] = await Promise.all([
      query('SELECT estado, COUNT(*)::int AS total FROM cajones GROUP BY estado'),
      query('SELECT COUNT(*)::int AS total FROM usuarios'),
    ]);
    const resumen = { disponible: 0, ocupado: 0, reservado: 0 };
    porEstado.forEach((row) => {
      resumen[row.estado] = row.total;
    });
    res.json({ cajones: resumen, totalUsuarios: usuariosRows[0].total });
  } catch (err) {
    next(err);
  }
});

router.get('/horas-pico', async (req, res, next) => {
  try {
    const { desde, hasta } = parseRange(req);
    const { rows } = await query(
      `SELECT EXTRACT(HOUR FROM "timestamp")::int AS hora, COUNT(*)::int AS total
       FROM historial_accesos
       WHERE evento = 'ENTRADA' AND "timestamp" BETWEEN $1 AND $2
       GROUP BY hora ORDER BY hora`,
      [desde, hasta]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/dias-pico', async (req, res, next) => {
  try {
    const { desde, hasta } = parseRange(req);
    const { rows } = await query(
      `SELECT TO_CHAR("timestamp", 'ID')::int AS dia_iso,
              TRIM(TO_CHAR("timestamp", 'Day')) AS nombre_dia,
              COUNT(*)::int AS total
       FROM historial_accesos
       WHERE evento = 'ENTRADA' AND "timestamp" BETWEEN $1 AND $2
       GROUP BY dia_iso, nombre_dia
       ORDER BY dia_iso`,
      [desde, hasta]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/metricas', async (req, res, next) => {
  try {
    const periodo = PERIODOS[req.query.periodo] || 'day';
    const { desde, hasta } = parseRange(req);
    const { rows } = await query(
      `SELECT date_trunc($1, "timestamp") AS periodo,
              COUNT(*) FILTER (WHERE evento = 'ENTRADA')::int AS entradas,
              COUNT(*) FILTER (WHERE evento = 'SALIDA')::int AS salidas
       FROM historial_accesos
       WHERE "timestamp" BETWEEN $2 AND $3
       GROUP BY periodo ORDER BY periodo`,
      [periodo, desde, hasta]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
