const { query } = require('../config/db');
const { getSystemTime } = require('./systemTimeService');
const { setCajonEstado, broadcastEstadoActual } = require('./parkingService');

const CHECK_INTERVAL_MS = 5000;

// Cualquier reserva que siga "activa" al vencer su fecha_fin implica que el
// sensor IR nunca detecto el carro (si lo hubiera detectado, procesarLecturasIR
// ya la habria marcado como "completada"). Por eso alcanza con liberar el cajon.
async function expirarReservasVencidas() {
  const ahora = getSystemTime();
  const { rows } = await query(
    `UPDATE reservas SET estado = 'expirada'
     WHERE estado = 'activa' AND fecha_fin < $1
     RETURNING cajon_id`,
    [ahora]
  );

  if (rows.length === 0) return;

  const { rows: cajones } = await query(
    `SELECT numero FROM cajones WHERE id = ANY($1::int[])`,
    [rows.map((r) => r.cajon_id)]
  );
  for (const cajon of cajones) {
    await setCajonEstado(cajon.numero, 'disponible');
  }
  await broadcastEstadoActual();
}

function startReservationExpiryService() {
  const interval = setInterval(() => {
    expirarReservasVencidas().catch((err) => {
      console.error('Error al expirar reservas:', err);
    });
  }, CHECK_INTERVAL_MS);
  return interval;
}

module.exports = { startReservationExpiryService, expirarReservasVencidas };
